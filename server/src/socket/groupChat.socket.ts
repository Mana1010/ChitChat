import { Server } from "socket.io";

async function groupChat(io: Server) {
  const groupSocket = io.of("/group");
}
