import express from "express";
import * as cookie from "cookie";
import dotenv from "dotenv";
import { connectDB } from "./DbConfig";
import cookiesParser from "cookie-parser";
import cors from "cors";
import jwt from "jsonwebtoken";
import { Server, Socket } from "socket.io";
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

const io = new Server(server, {
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
  // send_message expects either { conversationId, senderId, content }
  // or for direct messages: { senderId, receiverId, content }
  socket.on("send_message", async (data: IsentMessage, callback: (response: unknown) => void) => {
    try {
      // basic validation
      if (!data.content || !data.senderId) {
        return callback?.({ ok: false, error: "Invalid message payload" });
      }

      // Direct message starting a new conversation
      if (!data.conversationId && data.senderId && data.receiverId) {
        // find existing direct conversation that contains both participants
        const existingConv = await Conversation.findOne({
          type: "direct",
          $and: [
            { "participants.userId": data.senderId },
            { "participants.userId": data.receiverId },
          ],
        });

        let convo = existingConv;
        if (!existingConv) {
          convo = await Conversation.create({
            type: "direct",
            participants: [
              { userId: data.senderId },
              { userId: data.receiverId },
            ],
          });
        }

        // convo is guaranteed to exist now
  const convoId = String(((convo as { _id?: unknown })._id) ?? "");

        const newMessage = await Message.create({
          conversationId: convoId,
          senderId: data.senderId,
          content: data.content,
          type: "text",
        });

        // update lastMessage
        await Conversation.findByIdAndUpdate(convoId, {
          $set: { "lastMessage.content": data.content, "lastMessage.senderId": data.senderId },
        });

        // emit new conversation event to both participants if it was created now
        if (!existingConv) {
          io.to(data.receiverId).emit("new_conversation", convo);
          io.to(data.senderId).emit("new_conversation", convo);
        }

        // emit message to both users
        io.to(data.receiverId).emit("receive_message", { ...newMessage.toObject(), conversationId: convoId });
        io.to(data.senderId).emit("receive_message", { ...newMessage.toObject(), conversationId: convoId });

        return callback?.({ ok: true, conversation: convo, message: newMessage });
      }

      // Message inside an existing conversation
      if (data.conversationId) {
        const newMessage = await Message.create({
          conversationId: data.conversationId,
          senderId: data.senderId,
          content: data.content,
          type: "text",
        });

        // Update lastMessage in Conversation
        await Conversation.findByIdAndUpdate(data.conversationId, {
          $set: { "lastMessage.content": data.content, "lastMessage.senderId": data.senderId },
        });

        // emit to room (conversationId) and also to sender/participants
        io.to(String(data.conversationId)).emit("receive_message", newMessage);
        // Also emit to sender's personal room to ensure their client gets it
        io.to(data.senderId).emit("receive_message", newMessage);

        return callback?.({ ok: true, message: newMessage });
      }

      return callback?.({ ok: false, error: "Unable to process message" });
    } catch (err) {
      console.error(err);
      return callback?.({ ok: false, error: "Server error" });
    }
  });


});
