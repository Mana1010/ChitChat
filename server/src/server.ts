import cors from "cors";
import express from "express";
import morgan from "morgan";
import { Server } from "socket.io";
import "dotenv/config";
import { publicChat } from "./listeners/publicChat.socket";
import mongoose from "mongoose";
import http from "http";
import "dotenv/config";

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "https://admin.socket.io"],
    credentials: true,
  },
});
app.use(morgan("dev"));
app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);

publicChat(io as any);
async function connectDb() {
  try {
    await mongoose.connect(process.env.MONGO_URI!);
    console.log("Connected to database");
  } catch (err) {
    process.exit(0);
  }
}
connectDb();
server.listen(PORT, () => {
  console.log(`The server is running on PORT ${PORT}`);
});
