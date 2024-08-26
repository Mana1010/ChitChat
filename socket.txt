import cors from "cors";
import express from "express";
import morgan from "morgan";
import { Server } from "socket.io";
import "dotenv/config";
import { instrument } from "@socket.io/admin-ui";
import http from "http";

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

// const messages: Messages = {
//   public: [],
//   private: {},
// };
io.use((socket, next) => {
  console.log(socket.handshake.auth);
  if (socket.handshake.auth.token) {
    next();
    return;
  } else {
    console.log("You are not authenticated yet!");
    next(new Error("You are not authenticated yet!"));
  }
});
const messages: any[] = [];
io.on("connection", (socket) => {
  socket.on("chat_message", (message, room) => {
    // messages.public.push({ name: socket.id, content: message });
    messages.push({ name: socket.id, content: message });
    if (room === "Public") {
      socket.broadcast.emit("chat_message", messages);
    } else {
      socket.to(room).emit("chat_message", messages);
    }
  });
  socket.on("join_room", (room, cb) => {
    socket.join(room);
    cb(`Welcome to room ${room} ${socket.id}`);
  });
});
instrument(io, { auth: false });
server.listen(PORT, () => {
  console.log(`The server is running on PORT ${PORT}`);
});
