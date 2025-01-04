import { Server } from "socket.io";
import { Invitation, Request } from "../model/mail.model";
import { GroupConversation } from "../model/groupConversation.model";
import { Group } from "../model/group.model";
import { activeUsers } from "../utils/constant.utils";
import {
  GROUP_NAMESPACE,
  MAIL_NAMESPACE,
  NOTIFICATION_NAMESPACE,
  PRIVATE_NAMESPACE,
} from "../utils/namespaces.utils";
import { appLogger } from "../utils/loggers.utils";
import mongoose from "mongoose";
import { GroupChatDetails } from "../types/shared.types";
import { PrivateConversation } from "../model/privateConversation.model";

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
      async (
        { message, groupId }: { message: string; groupId: string },
        callback
      ) => {
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

          callback({ success: true, data: result._id });
          socket.broadcast.to(`active:${groupId}`).emit("display-message", {
            messageDetails: result,
          });
          socket.broadcast.to(groupId).emit("update-conversation-list", {
            message,
            groupId,
            senderId: userId,
            type: "text",
            lastMessageCreatedAt:
              groupConversationResult.lastMessage.lastMessageCreatedAt,
            sender_details: {},
          });
        } catch (err) {
          callback({ success: false, data: null });
          appLogger.error(err);
        }
      }
    );

    socket.on(
      "invitation-accepted",
      async ({
        groupId,
        groupChatDetails,
      }: {
        groupId: string;
        groupChatDetails: GroupChatDetails;
      }) => {
        const groupResult = await Group.create({
          sender: userId,
          groupId,
          type: "system",
          message: "joined the group",
        });

        const result = await Group.findById(groupResult._id)
          .populate({
            path: "sender",
            select: ["name", "profilePic", "status", "_id"],
          })
          .select(["-updatedAt"]);

        socket.broadcast.to(`active:${groupId}`).emit("user-joined-group", {
          messageDetails: result,
        });
        socket.broadcast.to(groupId).emit("update-conversation-list", {
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

    // socket.on("read-message", async ({ groupId }) => {
    //   let getUserId = membersWhoReadMessage.get(groupId);
    //   if (!membersWhoReadMessage.has(groupId)) {
    //     membersWhoReadMessage.set(groupId, []);
    //     getUserId = membersWhoReadMessage.get(groupId);
    //   }
    //   if (
    //     membersWhoReadMessage.has(groupId) &&
    //     !getUserId?.some((memberId) => userId === memberId)
    //   ) {
    //     await GroupConversation.findByIdAndUpdate(groupId, {
    //       $push: { memberReadMessage: userId },
    //     });
    //     getUserId?.push(userId);
    //   }
    // });

    socket.on(
      "add-conversation",
      async ({
        conversationId,
        senderId,
      }: {
        conversationId: string;
        senderId: string;
      }) => {
        if (!conversationId || !senderId) return;
        const getConversation = await PrivateConversation.aggregate([
          {
            $match: { _id: new mongoose.Types.ObjectId(conversationId) },
          },
          {
            $limit: 1,
          },
          {
            $unwind: "$participants",
          },
          {
            $match: {
              participants: new mongoose.Types.ObjectId(senderId),
            },
          },
          {
            $lookup: {
              from: "users",
              localField: "participants",
              foreignField: "_id",
              as: "participant_details",
            },
          },
          {
            $addFields: {
              participant_details: { $first: "$participant_details" },
            },
          },
          {
            $project: {
              lastMessage: 1,
              already_read_message: true,
              participant_details: {
                name: 1,
                profilePic: 1,
                _id: 1,
                status: 1,
              },
              is_user_already_seen_message: true,
              updateAt: 1,
            },
          },
        ]);
        const conversationDetails = getConversation[0];
        PRIVATE_NAMESPACE(io)
          .to(senderId)
          .emit("add-chatlist", conversationDetails);
      }
    );

    socket.on(
      "join-room",
      async ({ groupId, userId }: { groupId: string; userId: string }) => {
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
        if (!activeUsers.has(userId)) {
          activeUsers.set(userId, `active:${groupId}`);
        }
        socket.join(activeUsers.get(userId));
        socket.join(userId);
      }
    );

    socket.on(
      "leave-room",
      async ({ groupId, userId }: { groupId: string; userId: string }) => {
        const allGroupJoinedIds = (await GroupConversation.find({
          members: {
            $elemMatch: {
              status: "active",
              memberInfo: new mongoose.Types.ObjectId(userId),
            },
          },
        }).select("_id")) as { _id: string }[];

        if (activeUsers.has(userId)) {
          socket.leave(activeUsers.get(userId));
          activeUsers.delete(userId);
        }
        for (let i = 0; i < allGroupJoinedIds.length; i++) {
          socket.leave(allGroupJoinedIds[i]._id.toString());
        }
        socket.leave(userId);
      }
    );
  });
}
