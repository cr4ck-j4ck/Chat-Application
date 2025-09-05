import express from "express";
import * as cookie from "cookie";
import dotenv from "dotenv";
import { connectDB } from "./DbConfig";
import cookiesParser from "cookie-parser";
import cors from "cors";
import jwt from "jsonwebtoken";
import { Server } from "socket.io";
import { Request, Response, NextFunction } from "express";
import { Message } from "./models/message.model";
import { SocketData } from "./Types/socket";

dotenv.config();

// Routes I2mport
import UserRouter from "./Routes/user.routes";
import { type IsentMessage } from "./Types/interface.";
import { Conversation } from "./models/conversation.model";

const Port = process.env.PORT || 3000;
const app = express();
connectDB(process.env.MONGO_URI!);

// Using Routes
app.use(
  cors({
    origin: ["http://localhost:5173", "https://gufta-gu.vercel.app"], // specify exact origin
    credentials: true, // allow credentials
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookiesParser());
app.use("/user", UserRouter);
app.get("/random", (req, res) => {
  res.redirect("https://www.google.com");
});
app.use((err: unknown, req: Request, res: Response, next: NextFunction) => {
  console.error(err);
  res.status(500).json({ message: "Internal Server Error" });
});

const server = app.listen(Port, () => {
  console.log(`Started listening on Port ${Port}`);
});

const io = new Server<any, any, any, SocketData>(server, {
  cors: {
    origin: ["http://localhost:5173", "https://gufta-gu.vercel.app"],
    credentials: true,
  },
});
app.set("io", io);
io.use((socket, next) => {
  const token = socket.handshake.headers.cookie;
  if (!token) {
    return next(new Error("Token Required!!"));
  }
  const parsedCookie = cookie.parse(token) as {
    token: string;
    refreshToken: string;
  };
  const verified = jwt.verify(parsedCookie.token, process.env.JWT_SECRET!) as {
    userName: string;
    userId: string;
  };

  if (!verified) {
    return next(new Error("You are not loggedin!!"));
  }
  socket.data.user = {
    userId: verified.userId,
    userName: verified.userName,
  };
  next();
});

io.on("connection", (socket) => {
  socket.join(socket.data.user.userId);
  console.log(`A user Connected w ith userName ${socket.data.user.userName}`);
  socket.on("send_message", async (data: IsentMessage) => {
    // Save to DB
    if (data.participants instanceof Array && !data.conversationId) {
      return socket.emit("errorOfConvoMsg", "Please Provide conversation id ");
    }
  
    if (!data.conversationId && !(data.participants instanceof Array) && data.userName) {
      const newConvo = await Conversation.create({
        participants: [data.senderId, data.participants.userId],
        type: "direct",
      });
      await Message.create({
        conversationId: newConvo._id,
        senderId: data.senderId,
        content: data.content,
        type: "text",
      });
      const socks = await io.in(data.userName).fetchSockets();
      socks.forEach(s => 
        s.join(newConvo.id)
      )
      socket.join(newConvo.id);
      return socket.to(newConvo.id).emit("receive_message", data.content);
    }
    const newMessage = await Message.create({
      conversationId: data.conversationId,
      sender: data.senderId,
      content:data.content,
      type:"text",
    });

    // Update lastMessage in Chat
    await Conversation.findByIdAndUpdate(data.conversationId, {
      $set:{"lastMessage.content":data.content,"lastMessage.senderId":data.senderId}
    });
    // Emit to all users in the room
    if(data.participants instanceof Array){
      io.to(data.conversationId).emit("receive_message", newMessage);
    }else{
      io.to(data.participants.userId).emit("receive_message", newMessage)
    }
  });
});
