import { Server } from "socket.io";
import { NOTIFICATION_NAMESPACE } from "../utils/namespaces.utils";
export function handleNotificationSocket(io: Server) {
  NOTIFICATION_NAMESPACE(io).on("connection", (socket) => {
    console.log("Connected to Notification Successfully!");

    socket.on("join-room", ({ userId }) => {
      console.log("Joined Notification Room!");
      socket.join(userId);
    });
    socket.on("leave-room", ({ userId }) => {
      socket.leave(userId);
    });
  });
}
