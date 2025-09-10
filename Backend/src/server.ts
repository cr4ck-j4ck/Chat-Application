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

// Routes Import
import UserRouter from "./Routes/user.routes";
import { type IsentMessage } from "./Types/interface.";
import { Conversation } from "./models/conversation.model";

const Port = process.env.PORT || 3000;
const app = express();

// Connect to database
connectDB(process.env.MONGO_URI!);

// Middleware
app.use(
  cors({
    origin:["https://gufta-gu.vercel.app","http://localhost:5173"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookiesParser());

// Routes
app.use("/user", UserRouter);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
});

// Test endpoint to check database connection
app.get("/test-db", async (req, res) => {
  try {
    const User = require("./models/user.model").default;
    const Conversation = require("./models/conversation.model").Conversation;
    const userCount = await User.countDocuments();
    const conversationCount = await Conversation.countDocuments();
    res.json({
      status: "OK",
      userCount,
      conversationCount,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      status: "ERROR",
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// Error handling middleware
app.use((err: unknown, req: Request, res: Response, next: NextFunction) => {
  console.error("Error:", err);

  if (err instanceof Error) {
    res.status(500).json({
      message: "Internal Server Error",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  } else {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

const server = app.listen(Port, () => {
  console.log(`🚀 Server started on port ${Port}`);
});

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin:
      process.env.NODE_ENV === "production"
        ? ["https://gufta-gu.vercel.app"]
        : ["http://localhost:5173"],
    credentials: true,
  },
  pingTimeout: 60000,
  pingInterval: 25000,
});

app.set("io", io);

// Socket authentication middleware
io.use((socket, next) => {
  try {

    const token = socket.handshake.headers.cookie;
    if (!token) {
      console.log("No cookie found in socket headers");
      return next(new Error("Authentication required"));
    }

    const parsedCookie = cookie.parse(token) as {
      token: string;
      refreshToken: string;
    };


    if (!parsedCookie.token) {
      console.log("No token found in parsed cookies");
      return next(new Error("Invalid token"));
    }

    const verified = jwt.verify(
      parsedCookie.token,
      process.env.JWT_SECRET!
    ) as {
      userName: string;
      userId: string;
    };


    if (!verified || !verified.userId || !verified.userName) {
      console.log("Invalid JWT payload:", verified);
      return next(new Error("Invalid token payload"));
    }

    socket.data.user = {
      userId: verified.userId,
      userName: verified.userName,
    };

    next();
  } catch (error) {
    console.error("Socket authentication error:", error);
    next(new Error("Authentication failed"));
  }
});

// Socket connection handling
io.on("connection", (socket) => {
  const user = socket.data.user;

  if (!user) {
    console.log("No user data found, disconnecting socket");
    socket.disconnect();
    return;
  }

  socket.join(user.userId);

  // Handle message sending
  socket.on(
    "send_message",
    async (data: IsentMessage, callback: (response: any) => void) => {
      try {

        // Validate input
        if (!data.content || !data.senderId) {
          console.log("Invalid message payload:", {
            content: data.content,
            senderId: data.senderId,
          });
          return callback?.({ ok: false, error: "Invalid message payload" });
        }

        if (data.content.length > 5000) {
          return callback?.({ ok: false, error: "Message too long" });
        }

        // Verify sender is the authenticated user
        if (data.senderId !== user.userId) {
          console.log("Unauthorized sender:", {
            dataSenderId: data.senderId,
            userId: user.userId,
          });
          return callback?.({ ok: false, error: "Unauthorized" });
        }

        let conversationId: string;
        let conversation: any;

        // Handle direct message
        if (!data.conversationId && data.receiverId) {

          // Find existing conversation or create new one
          const existingConv = await Conversation.findOne({
            type: "direct",
            $and: [
              { "participants.userId": data.senderId },
              { "participants.userId": data.receiverId },
            ],
          });

          if (existingConv) {
            conversation = existingConv;
            conversationId = existingConv._id.toString();
          } else {
            console.log("Creating new conversation");
            // Create new conversation
            conversation = await Conversation.create({
              type: "direct",
              participants: [
                {
                  userId: data.senderId,
                  isMuted: false,
                  isPinned: false,
                  unreadCount: 0,
                },
                {
                  userId: data.receiverId,
                  isMuted: false,
                  isPinned: false,
                  unreadCount: 0,
                },
              ],
            });
            conversationId = conversation._id.toString();

            // Emit new conversation to both participants
           io.to(data.receiverId.toString()).emit("new_conversation", conversation);
io.to(data.senderId.toString()).emit("new_conversation", conversation);
          }
        } else if (data.conversationId) {
          // Handle existing conversation
          conversationId = data.conversationId.toString();
          conversation = await Conversation.findById(conversationId);

          if (!conversation) {
            console.log("Conversation not found:", conversationId);
            return callback?.({ ok: false, error: "Conversation not found" });
          }
        } else {
          console.log("Invalid message data - no conversationId or receiverId");
          return callback?.({ ok: false, error: "Invalid message data" });
        }

        // Create message
        const newMessage = await Message.create({
          conversationId,
          senderId: data.senderId,
          content: data.content.trim(),
          type: data.type || "text",
        });

        // Update conversation's last message
        await Conversation.findByIdAndUpdate(conversationId, {
          $set: {
            "lastMessage.content": data.content.trim(),
            "lastMessage.senderId": data.senderId,
            updatedAt: new Date(),
          },
        });

        // Emit message to conversation participants
        const messageData = {
          ...newMessage.toObject(),
          conversationId,
          timestamp: newMessage.createdAt.toISOString(),
        };

        // Emit to all participants in the conversation
        conversation.participants.forEach((participant: any) => {
          io.to(participant.userId.toString()).emit(
            "receive_message",
            messageData
          );
        });

        return callback?.({ ok: true, message: messageData, conversation });
      } catch (error) {
        console.error("Error sending message:", error);
        return callback?.({ ok: false, error: "Failed to send message" });
      }
    }
  );

  // Handle disconnection
  socket.on("disconnect", (reason) => {
    console.log(`👋 User disconnected: ${user.userName} (${reason})`);
  });

  // Handle errors
  socket.on("error", (error) => {
    console.error(`Socket error for user ${user.userName}:`, error);
  });
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully");
  server.close(() => {
    console.log("Process terminated");
  });
});

process.on("SIGINT", () => {
  console.log("SIGINT received, shutting down gracefully");
  server.close(() => {
    console.log("Process terminated");
  });
});
