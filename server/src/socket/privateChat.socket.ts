import { Server } from "socket.io";
import { Private } from "../model/private.model";
import { Conversation } from "../model/conversation.model";
import mongoose from "mongoose";

interface Payload {
  conversationId: string;
  userId: string;
  message: string;
  messageType: string;
  participantId?: string;
}
async function updateConversation(payload: Payload, addUnreadMessage: number) {
  const getTotalUnreadMessages = await Conversation.findById(
    payload.conversationId
  ).select("hasUnreadMessages");
  const updatedConversation = await Conversation.findByIdAndUpdate(
    payload.conversationId,
    {
      $set: {
        "lastMessage.sender": payload.userId,
        "lastMessage.text": payload.message,
        "lastMessage.lastMessageCreatedAt": new Date(),
        "lastMessage.messageType": payload.messageType,
        "hasUnreadMessages.user": payload.participantId,
        "hasUnreadMessages.totalUnreadMessages":
          getTotalUnreadMessages.hasUnreadMessages.totalUnreadMessages +
          addUnreadMessage,
      },
    },
    {
      new: true,
    }
  );
  return updatedConversation;
}
export function privateChat(io: Server) {
  const privateSocket = io.of("/private");
  privateSocket.on("connection", (socket) => {
    const { userId } = socket.handshake.auth;
    const typingUsers = [];
    socket.on(
      "send-message",
      async ({ message, messageType, conversationId, receiverId }) => {
        try {
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

            socket.broadcast.to(conversationId).emit("display-message", {
              // To send a message and display to specific user only.
              getProfile,
              conversation: conversationId,
            });
            const updatedConversation = await updateConversation(
              {
                conversationId,
                userId,
                message,
                messageType,
                participantId: receiverId,
              },
              1
            );
            socket.broadcast
              .to(receiverId)
              .emit("display-unread-message", conversationId);
            socket.broadcast
              .to(receiverId) //To emit only to the receiver to avoid unnecessary emitting from the other connection
              .emit("display-updated-chatlist", {
                newMessage: message,
                conversationId,
                participantId: userId,
                lastMessageCreatedAt:
                  updatedConversation.lastMessage.lastMessageCreatedAt,
              });
          }
        } catch (err) {
          console.log(err);
        }
      }
    );
    socket.on("read-message", async ({ conversationId, participantId }) => {
      console.log("Running the read message");

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
              getUnread.totalUnreadMessages = 0;
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
    socket.on(
      "send-reaction",
      async ({ reaction, messageId, conversationId }) => {
        await Private.findByIdAndUpdate(messageId, {
          reaction,
        });
        socket.broadcast
          .to(conversationId)
          .emit("display-reaction", { reaction, messageId });
      }
    );
    socket.on("join-room", (conversationId) => {
      socket.join(conversationId);
    });
    socket.on("join-receiverId-room", (receiverId) => {
      if (receiverId) {
        socket.join(receiverId);
      }
    });
    socket.on("leave-room", (conversationId) => {
      socket.leave(conversationId);
    });
    socket.on("leave-receiverId-room", (receiverId) => {
      socket.leave(receiverId);
    });
  });
}
