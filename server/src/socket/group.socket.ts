import { Server } from "socket.io";
import { Invitation } from "../model/mail.model";
import { GroupConversation } from "../model/groupConversation.model";
import { Group } from "../model/group.model";
import { GROUP_NAMESPACE, MAIL_NAMESPACE } from "../utils/namespaces.utils";
import { group } from "console";

type RequestedUsers = { id: string; name: string };
export async function handleGroupSocket(io: Server) {
  GROUP_NAMESPACE(io).on("connection", (socket) => {
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
        await GroupConversation.updateOne(
          { _id: groupId },
          {
            $push: { members: { $each: requestedMembers } },
          }
        );
        requestedUsers.forEach((user) => {
          MAIL_NAMESPACE(io)
            .to(user.id)
            .emit("update-mail", { sentAt: new Date(), isAlreadyRead: false });
        });
      }
    );
    socket.on("invitation-accepted", async (groupId) => {
      const result = await Group.create({
        sender: userId,
        groupId,
        type: "system",
        message: "joined the group",
      }).then((doc) =>
        doc.populate({
          path: "sender",
          select: ["name", "profilePic", "status", "_id"],
        })
      );

      socket.broadcast.to(groupId).emit("display-message", {
        messageDetails: result,
      });
    });
    socket.on("send-message", async ({ message, groupId }) => {
      try {
        const result = await Group.create({
          groupId,
          message,
          sender: userId,
        }).then((doc) =>
          doc.populate({
            path: "sender",
            select: ["name", "profilePic", "status", "_id"],
          })
        );
        await GroupConversation.findByIdAndUpdate(groupId, {
          $push: { memberReadMessage: userId },
        });
        socket.broadcast.to(groupId).emit("display-message", {
          messageDetails: result,
        });
      } catch (err) {
        console.log("Error asf");
      }
    });

    socket.on("join-room", (groupId) => {
      console.log("SUCCESSFULLY JOINED THE ROOM FOR GROUP");
      socket.join(groupId);
    });
    socket.on("leave-room", (groupId) => {
      socket.leave(groupId);
    });
  });
}
