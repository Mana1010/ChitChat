import { Server } from "socket.io";
import { Invitation, Mail, Request } from "../model/mail.model";
import { GroupConversation } from "../model/groupConversation.model";
import { Group } from "../model/group.model";
import { GROUP_NAMESPACE, MAIL_NAMESPACE } from "../utils/namespaces.utils";
import { appLogger } from "../utils/loggers.utils";
import mongoose from "mongoose";

type RequestedUsers = { id: string; name: string };
const membersWhoReadMessage = new Map<string, string[]>();
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
        await GroupConversation.updateOne(
          { _id: groupId },
          {
            $push: { members: { $each: requestedMembers } },
          }
        );
        membersWhoReadMessage.set(groupId, []); //add the group in map
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

        requestedUsers.forEach(({ id }) => {
          MAIL_NAMESPACE(io).to(id).emit("update-mail", {
            sentAt: new Date(),
            isAlreadyRead: false,
            kind: "invitation",
          });
        });
      }
    );
    socket.on("send-group-request", async ({ groupId }) => {
      const getAdmins = await GroupConversation.aggregate([
        {
          $match: { _id: new mongoose.Types.ObjectId(groupId as string) },
        },
        {
          $addFields: {
            get_all_admin: {
              $filter: {
                input: "$members",
                cond: {
                  $eq: ["$$this.role", "admin"],
                },
              },
            },
          },
        },
        {
          $addFields: {
            get_all_admin: {
              $map: {
                input: "$get_all_admin",
                in: "$$this.memberInfo",
              },
            },
          },
        },
        {
          $project: {
            _id: 0,
            get_all_admin: 1,
          },
        },
      ]);
      const getAllAdmin: string[] = getAdmins[0].get_all_admin;
      await Promise.all(
        getAllAdmin.map(async (adminId) => {
          await Request.create({
            from: userId,
            body: groupId,
            to: adminId,
            type: "request",
          });
        })
      );
      getAllAdmin.map((adminId) => {
        MAIL_NAMESPACE(io).to(adminId.toString()).emit("update-mail", {
          sentAt: new Date(),
          isAlreadyRead: false,
          kind: "request",
        });
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
                  "lastMessage.sender": userId,
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

          const memberIdList = [];
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

          membersWhoReadMessage.set(groupId, [userId]);
          for (let i = 0; i < getAllMembers.length; i++) {
            memberIdList.push(getAllMembers[i].member_details._id.toString());
          }
          socket.broadcast.to(memberIdList).emit("update-chatlist", {
            groupId,
            lastMessage: groupConversationResult.lastMessage.text,
            lastMessageCreatedAt:
              groupConversationResult.lastMessage.lastMessageCreatedAt,
            type: "text",
            senderId: userId,
          });
        } catch (err) {
          appLogger.error(err);
        }
      }
    );
    socket.on("read-message", async ({ groupId }) => {
      let getUserId = membersWhoReadMessage.get(groupId);
      if (!membersWhoReadMessage.has(groupId)) {
        membersWhoReadMessage.set(groupId, []);
        getUserId = membersWhoReadMessage.get(groupId);
      }
      if (
        membersWhoReadMessage.has(groupId) &&
        !getUserId?.some((memberId) => userId === memberId)
      ) {
        await GroupConversation.findByIdAndUpdate(groupId, {
          $push: { memberReadMessage: userId },
        });
        getUserId?.push(userId);
      }
    });

    socket.on("join-room", ({ groupId, userId }) => {
      console.log("SUCCESSFULLY JOINED THE ROOM FOR GROUP");
      socket.join(groupId);
      socket.join(userId);
    });
    socket.on("leave-room", ({ groupId, userId }) => {
      socket.leave(groupId);
      socket.leave(userId);
    });
  });
}
