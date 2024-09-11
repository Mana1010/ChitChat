import { Socket } from "socket.io";
import { Server } from "socket.io";
import { Private } from "../model/private.model";
export function privateChat(io: Server) {
  const privateSocket = io.of("/private");
  privateSocket.on("connection", (socket) => {
    const { userId } = socket.handshake.auth;
    socket.on("join-room", (conversationId) => {
      socket.join(conversationId);
      console.log(`Joined room ${conversationId}`);
    });
    socket.on("send-message", async ({ message, conversationId }) => {
      console.log("Running hehe");
      if (conversationId) {
        const createMessage = await Private.create({
          conversationId,
          sender: userId,
          message,
        });
        const getProfile = await Private.findById(createMessage._id)
          .populate([
            { path: "sender", select: ["profilePic", "name", "status"] },
          ])
          .select(["isRead", "message", "sender"]);
        socket.broadcast.to(conversationId).emit("display-message", getProfile);
      }
    });
  });
}
