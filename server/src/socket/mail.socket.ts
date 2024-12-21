import { MAIL_NAMESPACE } from "../utils/namespaces.utils";
import { Server } from "socket.io";
import { Group } from "../model/group.model";
import { GROUP_NAMESPACE } from "../utils/namespaces.utils";
import { appLogger } from "../utils/loggers.utils";
import mongoose from "mongoose";
import { GroupConversation } from "../model/groupConversation.model";

const handleGroupMessageCreation = async (
  groupId: string,
  senderId: string
) => {
  const groupResult = await Group.create({
    sender: senderId,
    groupId,
    type: "system",
    message: "joined the group",
  });
  return groupResult;
};
const handleUserJoinedGroupMessageAlert = async (
  senderId: string,
  groupId: string
) => {
  const groupResult = await handleGroupMessageCreation(senderId, groupId);
  const result = await Group.findById(groupResult._id).populate({
    path: "sender",
    select: ["name", "profilePic", "status", "_id"],
  });
  return result;
};

const handleUserJoinedGroupChatList = async (
  senderId: string,
  groupId: string
) => {
  await handleGroupMessageCreation(senderId, groupId);
  const result = await GroupConversation.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(groupId),
      },
    },
    { $limit: 1 },
    {
      $lookup: {
        from: "users",
        localField: "lastMessage.sender",
        foreignField: "_id",
        as: "sender_details",
      },
    },
    {
      $lookup: {
        from: "groupconversations",
        localField: "groupId",
        foreignField: "_id",
        as: "group_details",
      },
    },
    {
      $project: {
        groupName: 1,
        groupPhoto: 1,
        lastMessage: {
          sender: {
            name: "$sender_details.name",
          },
          text: 1,
          type: 1,
          lastMessageCreatedAt: 1,
        },
        // is_group_active: {
        //   $anyElementTrue: {
        //     $map: {
        //       input: "$filter_out_you",
        //       in: { $eq: ["$$this.status.type", "online"] },
        //     },
        //   },
        // },
        is_group_active: true,
      },
    },
  ]);
  return result[0];
};
export async function handleMailSocket(io: Server) {
  MAIL_NAMESPACE(io).on("connection", (socket) => {
    const { userId } = socket.handshake.auth;
    socket.on("invitation-accepted", async ({ groupId }) => {
      const result = await handleUserJoinedGroupMessageAlert(userId, groupId);
      console.log("Invitation Request here");
      console.log(result);
      GROUP_NAMESPACE(io).to(groupId).emit("user-joined-group", {
        messageDetails: result,
      });

      GROUP_NAMESPACE(io).to(groupId).emit("user-joined-group", {
        groupChatDetails: result.groupId,
      });
    });
    socket.on("request-accepted", async ({ requesterId, groupId }) => {
      appLogger.info("Running request accepted");
      const result = await handleUserJoinedGroupMessageAlert(
        requesterId,
        groupId
      );
      console.log("Request Result here");
      console.log(result);
      GROUP_NAMESPACE(io).to(groupId).emit("user-joined-group", {
        messageDetails: result,
      });
    });
    socket.on("join-room", ({ userId }) => {
      socket.join(userId);
    });

    socket.on("leave-room", ({ userId }) => {
      socket.leave(userId);
    });
  });
}
