import cors from "cors";
import express from "express";
import morgan from "morgan";
import { Server } from "socket.io";
import "dotenv/config";
import mongoose from "mongoose";
import http from "http";
import "dotenv/config";
import { router as messageRoute } from "./routes/message.route";
import { router as publicMessageRoute } from "./routes/public.message.route";
import { router as privateMessageRoute } from "./routes/private.message.route";
import { router as groupMessageRoute } from "./routes/group.message.route";
import { router as authRoute } from "./routes/auth.route";
import { router as appRoute } from "./routes/app.route";
import { errorHandle } from "./middleware/error.handling";
import { publicChat } from "./socket/publicChat.socket";
import { privateChat } from "./socket/privateChat.socket";
import { groupChat } from "./socket/groupChat.socket";
import { v2 as cloudinary } from "cloudinary";

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "https://admin.socket.io"],
  },
});
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

app.use(express.json());
app.use(morgan("dev"));
app.use(
  cors({
    origin: ["http://localhost:3000"],
    credentials: true,
  })
);
app.use("/api", messageRoute);
app.use("/api/auth", authRoute);
app.use("/api/public", publicMessageRoute);
app.use("/api/private", privateMessageRoute);
app.use("/api/group", groupMessageRoute);
//Consolidated route
app.use("/api/app", appRoute);
app.use(errorHandle);

publicChat(io as any);
privateChat(io as any);
groupChat(io as any);

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
