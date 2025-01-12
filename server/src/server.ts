import cors from "cors";
import express from "express";
import morgan from "morgan";
import { Server } from "socket.io";
import "dotenv/config";
import mongoose from "mongoose";
import http from "http";
import "dotenv/config";
import { router as publicMessageRoute } from "./routes/public.message.route";
import { router as privateMessageRoute } from "./routes/private.message.route";
import { router as groupMessageRoute } from "./routes/group.message.route";
import { router as authRoute } from "./routes/auth.route";
import { router as appRoute } from "./routes/app.route";
import { router as sharedRoute } from "./routes/shared.route";
import { errorHandle } from "./middleware/error.handling";
import { handlePublicSocket } from "./socket/public.socket";
import { handlePrivateSocket } from "./socket/private.socket";
import { handleGroupSocket } from "./socket/group.socket";
import { handleMailSocket } from "./socket/mail.socket";
import { handleStatusSocket } from "./socket/status.socket";
import { handleNotificationSocket } from "./socket/notification.socket";
import { v2 as cloudinary } from "cloudinary";
import helmet from "helmet";

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:3000",
      "https://admin.socket.io",
      "https://chit-chat-omega-dun.vercel.app",
    ],
    methods: ["GET", "POST"],
    credentials: true,
  },
});
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

app.use(helmet());
app.use(express.json());
app.use(morgan("dev"));
app.use(
  cors({
    origin: ["http://localhost:3000", "https://chit-chat-omega-dun.vercel.app"],
    credentials: true,
  })
);
app.use("/api/auth", authRoute);
app.use("/api/public", publicMessageRoute);
app.use("/api/private", privateMessageRoute);
app.use("/api/group", groupMessageRoute);
app.use("/api/shared", sharedRoute);
//Consolidated route
app.use("/api/app", appRoute);
app.use(errorHandle);

handlePublicSocket(io as any);
handlePrivateSocket(io as any);
handleGroupSocket(io as any);
handleMailSocket(io as any);
handleStatusSocket(io as any);
handleNotificationSocket(io as any);

console.log(process.env.MONGO_URI);
async function connectDb() {
  try {
    await mongoose.connect(process.env.MONGO_URI!);
    console.log("Connected to mongodb successfully");
  } catch (err) {
    process.exit(1);
  }
}
connectDb();
server.listen(PORT, () => {
  console.log(`The server is running on PORT ${PORT}`);
});
