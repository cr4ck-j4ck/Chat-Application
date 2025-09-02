import express from "express";
import * as cookie from "cookie";
import dotenv from "dotenv";
import { connectDB } from "./DbConfig";
import cookiesParser from "cookie-parser";
import cors from "cors";
import jwt from "jsonwebtoken";
import { Server } from "socket.io";
import { Request, Response, NextFunction } from "express";
import { SocketData } from "./Types/socket";
import { addUserNameToFriendList } from "./controllers/user.controller";
dotenv.config();

// Routes I2mport
import UserRouter from "./Routes/user.routes";

const Port = process.env.PORT || 3000;
const app = express();
connectDB(process.env.MONGO_URI!);

// Using Routes
app.use(
  cors({
    origin: "http://localhost:5173", // specify exact origin
    credentials: true, // allow credentials
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookiesParser());
app.use("/user", UserRouter);
app.get("/random",(req,res)=>{
  console.log("han aa gayi");
  res.redirect("https://www.google.com");
})
app.use((err: unknown, req: Request, res: Response, next: NextFunction) => {
  console.error(err);
  res.status(500).json({ message: "Internal Server Error" });
});

const server = app.listen(Port, () => {
  console.log(`Started listening on Port ${Port}`);
});

const io = new Server<any, any, any, SocketData>(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
  },
});
app.set("io",io);
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
  socket.join(socket.data.user.userName);
  console.log(`A user Connected w ith userName ${socket.data.user.userName}`);
});
