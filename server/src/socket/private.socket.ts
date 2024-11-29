import { Server } from "socket.io";
import { Private } from "../model/private.model";
import { PrivateConversation } from "../model/privateConversation.model";
import { PRIVATE_NAMESPACE } from "../utils/namespaces.utils";

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
              .select(["message", "sender"]);

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
              participantId: receiverId,
            });
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
          socket.broadcast.to(conversationId).emit("display-seen-user", {
            display_seen: false, //This will reset or remove the seen user icon.
          });
        } catch (err) {
          console.log(err);
        }
      }
    );

    socket.on("read-message", async ({ conversationId, participantId }) => {
      try {
        if (!conversationId || !participantId) {
          console.log("Empty Payload");
          return;
        }
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
    socket.on("add-conversation", async ({ conversationId, receiverId }) => {
      console.log(conversationId, receiverId);
      if (!conversationId || !receiverId) return;
      const getConversation = await PrivateConversation.findById(
        conversationId
      ).select("createdAt");
      socket.broadcast.to(receiverId).emit("display-updated-chatlist", {
        newMessage: "💭 Conversation Started",
        conversationId,
        participantId: "",
        lastMessageCreatedAt: getConversation.createdAt,
      });
    });
    socket.on(
      "send-reaction",
      async ({ reaction, messageId, conversationId }) => {
        await Private.findOne(
          { _id: messageId },
          {
            reactions: reaction,
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
