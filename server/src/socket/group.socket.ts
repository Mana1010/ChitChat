import { Server } from "socket.io";
import { Invitation, Request } from "../model/mail.model";
import { GroupConversation } from "../model/groupConversation.model";
import { Group } from "../model/group.model";
import {
  GROUP_NAMESPACE,
  MAIL_NAMESPACE,
  NOTIFICATION_NAMESPACE,
} from "../utils/namespaces.utils";
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
            const result = await Invitation.create({
              to: requestedUser.id,
              from: userId,
              body: groupId,
              type: "invitation",
            });
            NOTIFICATION_NAMESPACE(io)
              .to(requestedUser.id)
              .emit("trigger-notification", {
                sidebarKey: "totalUnreadMail",
                notificationId: result._id,
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
          const result = await Request.create({
            from: userId,
            body: groupId,
            to: adminId,
            type: "request",
          });
          NOTIFICATION_NAMESPACE(io)
            .to(adminId.toString())
            .emit("trigger-notification", {
              sidebarKey: "totalUnreadMail",
              notificationId: result._id,
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
                  "lastMessage.type": "text",
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
            socket.broadcast
              .to(getAllMembers[i].member_details._id.toString())
              .emit("update-chatlist", {
                groupId,
                lastMessage: groupConversationResult.lastMessage.text,
                lastMessageCreatedAt:
                  groupConversationResult.lastMessage.lastMessageCreatedAt,
                type: "text",
                senderId: userId,
              });
          }
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

    socket.on(
      "join-room",
      async ({ userId }: { groupId: string; userId: string }) => {
        console.log("SUCCESSFULLY JOINED THE ROOM FOR GROUP");
        const allGroupJoinedIds = (await GroupConversation.find({
          members: {
            $elemMatch: {
              status: "active",
              memberInfo: new mongoose.Types.ObjectId(userId),
            },
          },
        }).select("_id")) as { _id: string }[];

        for (let i = 0; i < allGroupJoinedIds.length; i++) {
          socket.join(allGroupJoinedIds[i]._id.toString());
        }

        socket.join(userId);
      }
    );
    socket.on(
      "leave-room",
      async ({ groupId, userId }: { groupId: string; userId: string }) => {
        socket.leave(groupId);
        socket.leave(userId);
      }
    );
  });
}
