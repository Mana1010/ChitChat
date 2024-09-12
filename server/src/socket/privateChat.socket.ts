import { Server } from "socket.io";
import { Private } from "../model/private.model";
import { Conversation } from "../model/conversation.model";
export function privateChat(io: Server) {
  const privateSocket = io.of("/private");
  privateSocket.on("connection", (socket) => {
    const { userId } = socket.handshake.auth;
    socket.on("send-message", async ({ message, conversationId }) => {
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
        await Conversation.findByIdAndUpdate(conversationId, {
          lastMessage: message,
        });
        socket.broadcast.to(conversationId).emit("display-message", getProfile);
        socket.emit("display-updated-chatlist", {
          newMessage: message,
          conversationId,
        });
      }
    });
    socket.on("join-room", (conversationId) => {
      socket.join(conversationId);
      console.log(`Joined room ${conversationId}`);
    });
  });
}
