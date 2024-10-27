import { Server } from "socket.io";

export async function groupChat(io: Server) {
  const groupSocket = io.of("/group");
  groupSocket.on("connection", (socket) => {
    console.log("Connected from group");
  });
}
