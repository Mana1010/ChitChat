import { MAIL_NAMESPACE } from "../utils/namespaces.utils";
import { Server } from "socket.io";
import { Group } from "../model/group.model";
import { GROUP_NAMESPACE } from "../utils/namespaces.utils";

const handleUserJoinedGroup = async (senderId: string, groupId: string) => {
  await Group.create({
    sender: senderId,
    groupId,
    type: "system",
    message: "joined the group",
  });
  const result = await Group.findOne({ groupId })
    .populate({
      path: "sender",
      select: ["name", "profilePic", "status", "_id"],
    })
    .populate({
      path: "groupId",
      select: ["groupPhoto", "groupName", "_id", "lastMessage"],
    });
  return result;
};
export async function handleMailSocket(io: Server) {
  MAIL_NAMESPACE(io).on("connection", (socket) => {
    const { userId } = socket.handshake.auth;
    socket.on("invitation-accepted", async ({ groupId }) => {
      const result = await handleUserJoinedGroup(userId, groupId);

      GROUP_NAMESPACE(io).to(groupId).emit("user-joined-group", {
        messageDetails: result,
      });

      GROUP_NAMESPACE(io).to(groupId).emit("user-joined-group", {
        groupChatDetails: result.groupId,
      });
    });
    socket.on("request-accepted", async ({ requesterId, groupId }) => {
      const result = await handleUserJoinedGroup(requesterId, groupId);

      GROUP_NAMESPACE(io).to(groupId).emit("user-joined-group", {
        messageDetails: result,
      });
      GROUP_NAMESPACE(io).to(requesterId).emit("user-joined-group", {
        groupChatDetails: result.groupId,
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
