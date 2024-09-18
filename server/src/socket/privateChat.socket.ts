import { Server } from "socket.io";
import { Private } from "../model/private.model";
import { Conversation } from "../model/conversation.model";
import mongoose from "mongoose";
export function privateChat(io: Server) {
  const privateSocket = io.of("/private");
  privateSocket.on("connection", (socket) => {
    const { userId } = socket.handshake.auth;
    const typingUsers = [];
    socket.on(
      "send-message",
      async ({ message, conversationId, participantId }) => {
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
          const getTotalUnreadMessages = await Conversation.findById(
            conversationId
          ).select("hasUnreadMessages");
          const updatedConversation = await Conversation.findByIdAndUpdate(
            conversationId,
            {
              $set: {
                "lastMessage.sender": userId,
                "lastMessage.text": message,
                "lastMessage.lastMessageCreatedAt": new Date(),
                "hasUnreadMessages.user": participantId,
                "hasUnreadMessages.totalUnreadMessages":
                  getTotalUnreadMessages.hasUnreadMessages.totalUnreadMessages +
                  1,
              },
            },
            {
              new: true,
            }
          );
          socket.broadcast
            .to(conversationId)
            .emit("display-message", getProfile);
          socket.broadcast
            .to(conversationId)
            .emit("display-unread-message", conversationId);
          socket.emit("display-updated-chatlist", {
            newMessage: message,
            conversationId,
            participantId: userId,
            lastMessageCreatedAt:
              updatedConversation.lastMessage.lastMessageCreatedAt,
          });
        }
      }
    );
    socket.on("read-message", async ({ conversationId, participantId }) => {
      try {
        if (conversationId && participantId) {
          const getUnreadMessages = await Conversation.findById(
            conversationId
          ).select("hasUnreadMessages");
          const getUnread = getUnreadMessages.hasUnreadMessages;
          //This nested if will be checking and update only the hasUnreadMessages if there is no
          //unread messages yet and also to match the user that has not read the messages;
          if (getUnreadMessages) {
            if (
              getUnread.totalUnreadMessages !== 0 &&
              getUnread.user.toString() === userId
            ) {
              getUnreadMessages.hasUnreadMessages.totalUnreadMessages = 0;
              await getUnreadMessages.save();
            }
          }
          socket.emit("seen-message", {
            conversationId,
            hasUnreadMessages: getUnread,
          });
          socket.broadcast.to(conversationId).emit("display-seen-text", {
            user: getUnread.user,
            totalUnreadMessages: getUnread.totalUnreadMessages,
          });
        }
      } catch (err) {
        console.log(err);
      }
    });
    socket.on("join-room", (conversationId) => {
      socket.join(conversationId);
      console.log(`Joined room ${conversationId}`);
    });
  });
}
