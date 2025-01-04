import { Server, Socket } from "socket.io";
import { Public } from "../model/public.model";
import { User } from "../model/user.model";
import mongoose from "mongoose";
import { PRIVATE_NAMESPACE, PUBLIC_NAMESPACE } from "../utils/namespaces.utils";
import { PrivateConversation } from "../model/privateConversation.model";
function stopTyping(
  socket: Socket,
  typingUsers: { userId: string; userImg: string }[],
  userId: string
) {
  socket.on("stop-typing", () => {
    const findIndex = typingUsers.findIndex((user) => user.userId === userId);
    if (findIndex !== -1) {
      //If the id is exist in the typingUser array[]
      typingUsers.splice(findIndex, 1);
    }
    socket.broadcast.emit("display-during-typing", typingUsers);
  });
}
async function userReactionAggregate(userId: string, messageId: string) {
  const findMessageAndCheckUserReaction = await Public.aggregate([
    {
      $match: { _id: new mongoose.Types.ObjectId(messageId) },
    },
    {
      $project: {
        reaction: {
          $filter: {
            input: "$reactions",
            cond: {
              $eq: ["$$this.reactor", new mongoose.Types.ObjectId(userId)],
            },
          },
        },
      },
    },
    {
      $project: {
        reaction: { $arrayElemAt: ["$reaction", 0] },
        _id: 0,
      },
    },
  ]);
  return findMessageAndCheckUserReaction;
}
export function handlePublicSocket(io: Server) {
  const typingUsers: { userId: string; userImg: string }[] = [];

  PUBLIC_NAMESPACE(io).on("connection", async (socket: Socket) => {
    const { userId } = socket.handshake.auth;
    socket.on("send-message", async (message: string, callback) => {
      try {
        const getId = await Public.create({
          message,
          sender: userId,
          isMessageDeleted: false,
        });
        const getUser = await Public.findById(getId._id) //Retrieving the Public messages
          .populate({
            path: "sender",
            select: ["name", "profilePic", "status"],
          })
          .select(["-updatedAt", "-__v"])
          .lean();

        callback({ success: true, data: getId._id });
        socket.broadcast.emit("get-message", getUser);
      } catch (err) {
        callback({ success: false, data: null });
      }
    });

    socket.on(
      "send-reaction",
      async ({
        reaction,
        messageId,
      }: {
        reaction: string;
        messageId: string;
      }) => {
        if (!reaction || !messageId || !userId) return; //To ensure that those fields is not empty
        const findMessageAndCheckUserReaction = await userReactionAggregate(
          userId,
          messageId
        );
        //To check if the obj is empty then false else true

        if (Object.keys(findMessageAndCheckUserReaction[0]).length !== 0) {
          //If the user already reacted
          if (
            findMessageAndCheckUserReaction[0].reaction.reactionEmoji ===
            reaction
          ) {
            // this code is to remove or delete their reaction
            await Public.findByIdAndUpdate(messageId, {
              $pull: {
                reactions: {
                  reactor: userId,
                },
              },
            });
          } else {
            //This code is to update the reaction
            await Public.updateOne(
              { _id: messageId, "reactions.reactor": userId },
              { $set: { "reactions.$.reactionEmoji": reaction } } //The $ sign is to check the very first matched element then update its reaction
            );
          }
        } else {
          // this code is to add their reaction to a message
          await Public.findByIdAndUpdate(messageId, {
            $push: {
              reactions: {
                reactor: userId,
                reactionEmoji: reaction,
              },
            },
          });
        }
        const getUpdatedUserReaction = await userReactionAggregate(
          userId,
          messageId
        );
        if (Object.keys(getUpdatedUserReaction[0]).length) {
          socket.broadcast.emit("display-reaction", {
            isUserRemoveReaction: false,
            data: {
              reactor: getUpdatedUserReaction[0].reaction.reactor,
              reactionCreatedAt: getUpdatedUserReaction[0].reaction.reactor,
              reactionEmoji: getUpdatedUserReaction[0].reaction.reactionEmoji,
              messageId,
            },
          });
        } else {
          socket.broadcast.emit("display-reaction", {
            isUserRemoveReaction: true,
            data: {
              reactor: userId,
              messageId,
            },
          });
        }
      }
    );

    socket.on("during-typing", ({ userImg }) => {
      const checkSocketId = typingUsers.some(
        (typeUser) => typeUser.userId === userId
      );
      // if the socketId is not yet exist inside of an array and the typingUsers length should be atleast 5 users only.
      if (!checkSocketId && typingUsers.length <= 5) {
        typingUsers.push({ userId, userImg });
      }
      socket.broadcast.emit("display-during-typing", typingUsers);
    });
    stopTyping(socket, typingUsers, userId);

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
        PRIVATE_NAMESPACE(io)
          .to(senderId)
          .emit("add-chatlist", conversationDetails);
      }
    );

    socket.on("join-room", ({ userId }) => {
      socket.join(userId);
    });
    socket.off("leave-room", ({ userId }) => {
      socket.leave(userId);
    });
  });
}
