import { MAIL_NAMESPACE } from "../utils/namespaces.utils";
import { Server } from "socket.io";

export async function handleMailSocket(io: Server) {
  MAIL_NAMESPACE(io).on("connection", (socket) => {
    console.log("CONNECTED MAIL SUCCESSFULLY");

    socket.on("join-room", ({ userId }) => {
      socket.join(userId);
      console.log(`JOINED IN MAIL ROOM ${userId}`);
    });
    socket.on("leave-room", ({ userId }) => {
      socket.leave(userId);
    });
  });
}
