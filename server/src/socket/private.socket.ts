import { Server } from "socket.io";
import { Private } from "../model/private.model";
import { PrivateConversation } from "../model/privateConversation.model";
import {
  NOTIFICATION_NAMESPACE,
  PRIVATE_NAMESPACE,
} from "../utils/namespaces.utils";
import mongoose from "mongoose";

interface Payload {
  conversationId: string;
  userId: string;
  message: string;
  messageType: string;
  participantId?: string;
}
async function updateConversation(payload: Payload) {
  const updatedConversation = await PrivateConversation.findByIdAndUpdate(
    payload.conversationId,
    {
      $set: {
        "lastMessage.sender": payload.userId,
        "lastMessage.text": payload.message,
        "lastMessage.lastMessageCreatedAt": new Date(),
        "lastMessage.type": payload.messageType,
        userReadMessage: [payload.userId],
      },
    },

    {
      new: true,
    }
  );
  return updatedConversation;
}
export function handlePrivateSocket(io: Server) {
  PRIVATE_NAMESPACE(io).on("connection", (socket) => {
    const { userId } = socket.handshake.auth;
    socket.on(
      "send-message",
      async (
        { message, messageType, conversationId, participantId },
        callback
      ) => {
        console.log(message, messageType, conversationId, participantId);
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
              .select(["message", "sender", "type", "createdAt"]);

            socket.broadcast.to(conversationId).emit("display-message", {
              // To send a message and display to specific user only.
              getProfile,
              conversation: conversationId,
            });
            const updatedConversation = await updateConversation({
              conversationId,
              userId,
              message,
              messageType,
              participantId: participantId,
            });
            callback({ success: true, data: createMessage._id });
            socket.broadcast
              .to(participantId)
              .emit("display-unread-message", conversationId);

            socket.broadcast
              .to(participantId) //To emit only to the receiver to avoid unnecessary emitting from the other connection
              .emit("display-updated-chatlist", {
                newMessage: message,
                conversationId,
                participantId: userId,
                lastMessageCreatedAt:
                  updatedConversation.lastMessage.lastMessageCreatedAt,
              });
          }
          socket.broadcast.to(conversationId).emit("display-seen-user", {
            display_seen: false, //This will reset or remove the seen user icon.
          });
          NOTIFICATION_NAMESPACE(io)
            .to(participantId)
            .emit("trigger-notification", {
              sidebarKey: "totalUnreadPrivateConversation",
              notificationId: conversationId,
            });
        } catch (err) {
          callback({ success: false, data: null });
          console.log(err);
        }
      }
    );

    socket.on("read-message", async ({ conversationId, participantId }) => {
      try {
        if (!conversationId || !participantId) return;

        const checkIfUserNotSeenMessage = await PrivateConversation.findById(
          conversationId
        ).select(["userReadMessage", "lastMessage.sender"]);

        if (!checkIfUserNotSeenMessage) return;
        console.log(checkIfUserNotSeenMessage);
        const listConversationUser =
          checkIfUserNotSeenMessage.userReadMessage.map((user: string) =>
            user.toString()
          ); //Lets first transform the new mongoose type to string();
        const isUserNotSeenMessage = listConversationUser.includes(userId);

        if (!isUserNotSeenMessage && listConversationUser.length <= 2) {
          checkIfUserNotSeenMessage.userReadMessage.push(userId);
          await checkIfUserNotSeenMessage.save();
        }
        socket.to(conversationId).emit("seen-message", {
          conversationId,
        });
        socket.broadcast.to(conversationId).emit("display-seen-user", {
          display_seen:
            checkIfUserNotSeenMessage.lastMessage.sender.toString() ===
            participantId, //This will check and only show the seen user display to those who sent the latest message
        });
      } catch (err) {
        console.log(err);
      }
    });
    socket.on(
      "add-conversation",
      async ({
        conversationId,
        senderId,
      }: {
        conversationId: string;
        senderId: string;
      }) => {
        if (!conversationId || !senderId) return;
        const getConversation = await PrivateConversation.aggregate([
          {
            $match: { _id: new mongoose.Types.ObjectId(conversationId) },
          },
          {
            $limit: 1,
          },
          {
            $unwind: "$participants",
          },
          {
            $match: {
              participants: new mongoose.Types.ObjectId(senderId),
            },
          },
          {
            $lookup: {
              from: "users",
              localField: "participants",
              foreignField: "_id",
              as: "participant_details",
            },
          },
          {
            $addFields: {
              participant_details: { $first: "$participant_details" },
            },
          },
          {
            $project: {
              lastMessage: 1,
              already_read_message: true,
              participant_details: {
                name: 1,
                profilePic: 1,
                _id: 1,
                status: 1,
              },
              is_user_already_seen_message: true,
              updateAt: 1,
            },
          },
        ]);
        const conversationDetails = getConversation[0];
        socket.broadcast.to(senderId).emit("add-chatlist", conversationDetails);
      }
    );
    socket.on(
      "send-reaction",
      async ({ reaction, messageId, conversationId }) => {
        await Private.updateOne(
          { _id: messageId },
          {
            $set: {
              reactions: reaction,
            },
          }
        );
        socket.broadcast
          .to(conversationId)
          .emit("display-reaction", { reaction, messageId });
      }
    );
    socket.on("during-typing", (conversationId) => {
      socket.broadcast.to(conversationId).emit("during-typing", conversationId);
    });
    socket.on("stop-typing", (conversationId) => {
      socket.broadcast.to(conversationId).emit("stop-typing", conversationId);
    });
    socket.on("join-room", ({ conversationId, userId }) => {
      socket.join(conversationId);
      socket.join(userId);
    });
    socket.on("leave-room", ({ conversationId, userId }) => {
      socket.leave(conversationId);
      socket.leave(userId);
    });
  });
}
