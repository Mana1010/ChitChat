import cors from "cors";
import express from "express";
import morgan from "morgan";
import { Server } from "socket.io";
import "dotenv/config";
import { publicChat } from "./socket/publicChat.socket";
import mongoose from "mongoose";
import http from "http";
import "dotenv/config";
import { router as messageRoute } from "./routes/message.route";
import { router as authRoute } from "./routes/auth.route";

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "https://admin.socket.io"],
  },
});
app.use(express.json());
app.use(morgan("dev"));
app.use(
  cors({
    origin: ["http://localhost:3000"],
    credentials: true,
  })
);
app.use("/api", messageRoute, authRoute);
publicChat(io as any);
async function connectDb() {
  try {
    await mongoose.connect(process.env.MONGO_URI!);
  } catch (err) {
    process.exit(0);
  }
}
connectDb();
server.listen(PORT, () => {
  console.log(`The server is running on PORT ${PORT}`);
});
