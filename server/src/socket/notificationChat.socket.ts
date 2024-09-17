import { Server } from "socket.io";

export function notificationSocket(io: Server) {
  const notificationSocket = io.of("/notification");
}
