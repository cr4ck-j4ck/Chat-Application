import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./DbConfig";
import cookiesParser from "cookie-parser"
import cors from "cors";
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
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "Internal Server Error" });
});
app.listen(Port, () => {
  console.log(`Started listening on Port ${Port}`);
});
