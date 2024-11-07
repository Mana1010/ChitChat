import { Server } from "socket.io";
import { User } from "../model/user.model";
import { Invitation } from "../model/mail.model";
import { GroupConversation } from "../model/groupConversation.model";
import { Group } from "../model/group.model";

type RequestedUsers = { id: string; name: string };
export async function groupChat(io: Server) {
  const groupSocket = io.of("/group");
  groupSocket.on("connection", (socket) => {
    const { userId } = socket.handshake.auth;
    socket.on(
      "send-request",
      async ({
        requestedUsers,
        groupId,
      }: {
        requestedUsers: RequestedUsers[];
        groupId: string;
      }) => {
        if (!requestedUsers || !groupId) return;
        const requestedMembers = [];

        for (let i = 0; i < requestedUsers.length; i++) {
          requestedMembers.push({
            memberInfo: requestedUsers[i].id,
            status: "pending",
          });
        }
        await Promise.all(
          requestedUsers.map(async (requestedUser: RequestedUsers) => {
            await Invitation.create({
              to: requestedUser.id,
              from: userId,
              body: groupId,
              type: "invitation",
            });
          })
        );
        await GroupConversation.findByIdAndUpdate(groupId, {
          $push: { members: { $each: requestedMembers } },
        });
      }
    );

    socket.on("send-message", async ({ message, groupId }) => {
      try {
        const sendMessage = await Group.create({
          groupId,
          message,
          sender: userId,
        });
        await GroupConversation.findByIdAndUpdate(groupId, {
          $push: { memberReadMessage: userId },
        });
        socket.broadcast.to(groupId).emit("display-message", {
          message: sendMessage.message,
          groupId,
          createdAt: sendMessage.createdAt,
          memberReadMessage: [userId],
        });
      } catch (err) {
        console.log("Error asf");
      }
    });

    socket.on("join-room", (groupId) => {
      socket.join(groupId);
    });
    socket.on("leave-room", (groupId) => {
      socket.leave(groupId);
    });
  });
}
