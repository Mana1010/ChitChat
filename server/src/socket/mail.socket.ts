import { GroupConversation } from "../model/groupConversation.model";
import { Request } from "../model/mail.model";
import { MAIL_NAMESPACE } from "../utils/namespaces.utils";
import { Server } from "socket.io";
import mongoose from "mongoose";
import { Group } from "../model/group.model";
import { GROUP_NAMESPACE } from "../utils/namespaces.utils";
export async function handleMailSocket(io: Server) {
  MAIL_NAMESPACE(io).on("connection", (socket) => {
    const { userId } = socket.handshake.auth;

    socket.on("invitation-accepted", async ({ groupId }) => {
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
