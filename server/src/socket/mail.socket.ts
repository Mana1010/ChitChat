import { MAIL_NAMESPACE } from "../utils/namespaces.utils";
import { Server } from "socket.io";
import { Group } from "../model/group.model";
import { GROUP_NAMESPACE } from "../utils/namespaces.utils";
import { GroupChatDetails, IdsSchema } from "../types/shared.types";
const handleGroupMessageCreation = async (
  senderId: string,
  groupId: string
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
  const result = await Group.findById(groupResult._id)
    .populate({
      path: "sender",
      select: ["name", "profilePic", "status", "_id"],
    })
    .select(["-updatedAt"]);
  return result;
};
export async function handleMailSocket(io: Server) {
  MAIL_NAMESPACE(io).on("connection", (socket) => {
    const { userId } = socket.handshake.auth;
    socket.on(
      "invitation-accepted",
      async ({
        groupId,
        groupChatDetails,
      }: {
        groupChatDetails: GroupChatDetails;
        groupId: string;
      }) => {
        const result = await handleUserJoinedGroupMessageAlert(userId, groupId);
        GROUP_NAMESPACE(io).to(`active:${groupId}`).emit("user-joined-group", {
          messageDetails: result,
        });
        GROUP_NAMESPACE(io)
          .to(groupId)
          .emit("update-conversation-list", {
            message: groupChatDetails.lastMessage.text,
            groupId,
            senderId: groupChatDetails._id,
            type: "system",
            lastMessageCreatedAt:
              groupChatDetails.lastMessage.lastMessageCreatedAt,
            sender_details: {
              name: groupChatDetails.lastMessage.sender.name,
              _id: groupChatDetails.lastMessage.sender._id,
            },
          });
      }
    );
    socket.on(
      "request-accepted",
      async ({
        requesterId,
        groupId,
        groupChatDetails,
      }: {
        requesterId: string;
        groupId: string;
        groupChatDetails: GroupChatDetails;
      }) => {
        const result = await handleUserJoinedGroupMessageAlert(
          requesterId,
          groupId
        );
        GROUP_NAMESPACE(io).to(`active:${groupId}`).emit("user-joined-group", {
          messageDetails: result,
        });

        GROUP_NAMESPACE(io).to(requesterId).emit("add-new-groupchat", {
          groupChatDetails,
        });
        GROUP_NAMESPACE(io).to(requesterId).emit("update-groupchat-list", {
          groupChatDetails,
        });
      }
    );
    socket.on("join-room", ({ userId }) => {
      socket.join(userId);
    });

    socket.on("leave-room", ({ userId }) => {
      socket.leave(userId);
    });
  });
}
