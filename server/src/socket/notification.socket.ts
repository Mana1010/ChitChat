import { Server } from "socket.io";

export function handleNotificationSocket(io: Server) {
  const notificationSocket = io.of("/notification");
}
