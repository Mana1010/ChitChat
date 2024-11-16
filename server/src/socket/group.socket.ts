import { Server } from "socket.io";
import { Invitation } from "../model/mail.model";
import { GroupConversation } from "../model/groupConversation.model";
import { Group } from "../model/group.model";
import { GROUP_NAMESPACE, MAIL_NAMESPACE } from "../utils/namespaces.utils";
import { groupLogger } from "../utils/loggers.utils";
import mongoose from "mongoose";

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
    socket.on(
      "send-message",
      async ({ message, groupId }: { message: string; groupId: string }) => {
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

          const groupConversationResult =
            await GroupConversation.findByIdAndUpdate(
              groupId,
              {
                $set: {
                  "lastMessage.text": message,
                  memberReadMessage: [userId],
                },
                $currentDate: { "lastMessage.lastMessageCreatedAt": true },
              },
              {
                new: true,
              }
            ).select("lastMessage");
          socket.broadcast.to(groupId).emit("display-message", {
            messageDetails: result,
          });
          // const getAllMembers = await GroupConversation.findOne({_id: groupId, }).select([
          //   "members.memberInfo",
          //   "-_id",
          // ])
          const memberId = [];
          const getAllMembers: { member_details: { _id: string } }[] =
            await GroupConversation.aggregate([
              {
                $match: { _id: new mongoose.Types.ObjectId(groupId) },
              },
              {
                $unwind: "$members",
              },
              {
                $lookup: {
                  from: "users",
                  localField: "members.memberInfo",
                  foreignField: "_id",
                  as: "member_details",
                },
              },
              {
                $match: {
                  member_details: {
                    $elemMatch: {
                      _id: {
                        $ne: new mongoose.Types.ObjectId(userId as string),
                      },
                      status: "Online",
                    },
                  },
                },
              },
              {
                $addFields: {
                  member_details: { $first: "$member_details" },
                },
              },
              {
                $project: {
                  _id: 0,
                  member_details: {
                    _id: 1,
                  },
                },
              },
            ]);

          for (let i = 0; i < getAllMembers.length; i++) {
            memberId.push(getAllMembers[i].member_details._id.toString());
          }
          console.log(memberId);
          socket.broadcast.to(memberId).emit("update-chatlist", {
            groupId,
            lastMessage: groupConversationResult.lastMessage.text,
            lastMessageCreatedAt:
              groupConversationResult.lastMessage.lastMessageCreatedAt,
            type: "text",
            senderId: userId,
          });
        } catch (err) {
          groupLogger.error(err);
        }
      }
    );

    socket.on("join-room", ({ groupId, memberId }) => {
      console.log("SUCCESSFULLY JOINED THE ROOM FOR GROUP");
      socket.join(groupId);
      socket.join(memberId);
    });
    socket.on("leave-room", ({ groupId, memberId }) => {
      socket.leave(groupId);
      socket.leave(memberId);
    });
  });
}
