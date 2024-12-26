import { MAIL_NAMESPACE } from "../utils/namespaces.utils";
import { Server } from "socket.io";
import { Group } from "../model/group.model";
import { GROUP_NAMESPACE } from "../utils/namespaces.utils";

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
    socket.on(
      "request-accepted",
      async ({ requesterId, groupId, groupChatDetails }) => {
        const result = await handleUserJoinedGroupMessageAlert(
          requesterId,
          groupId
        );
        console.log(result);
        GROUP_NAMESPACE(io).to(groupId).emit("user-joined-group", {
          messageDetails: result,
        });

        GROUP_NAMESPACE(io).to(requesterId).emit("update-chatlist", {
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
