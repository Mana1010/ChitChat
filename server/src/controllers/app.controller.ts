import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import { PrivateConversation } from "../model/privateConversation.model";
import { GroupConversation } from "../model/groupConversation.model";
import mongoose from "mongoose";
import { User } from "../model/user.model";
import { Invitation, Mail } from "../model/mail.model";

interface UserChatStatusObjSchema {
  privateConversationStatus: string | null;
  groupConversationStatus: string | null;
}
export const getSidebarNotificationAndCurrentConversation = asyncHandler(
  async (req: Request, res: Response) => {
    const { senderId } = req.params;
    const userChatStatusObj: UserChatStatusObjSchema = {
      privateConversationStatus: null,
      groupConversationStatus: null,
    };

    const userNotificationObj = {
      privateNotificationCount: 0,
      groupNotificationCount: 0,
      mailboxNotificationCount: 0,
    };

    try {
      const checkIfNewUserPrivate = await PrivateConversation.exists({
        participants: { $in: [senderId] },
      });

      if (checkIfNewUserPrivate?._id) {
        const getFirstPrivateConversationId = (await PrivateConversation.find({
          participants: { $in: [senderId] },
        })
          .sort({ "lastMessage.lastMessageCreatedAt": -1 })
          .limit(1)
          .select("_id")
          .lean()) as { _id: string }[];

        userChatStatusObj.privateConversationStatus =
          getFirstPrivateConversationId[0]._id;
      }
      const checkIfNewUserGroup = await GroupConversation.exists({
        members: { $elemMatch: { memberInfo: senderId, status: "active" } },
      });

      if (checkIfNewUserGroup?._id) {
        const getFirstGroupConversationId = (await GroupConversation.find({
          members: { $elemMatch: { memberInfo: senderId, status: "active" } },
        })
          .sort({ "lastMessage.lastMessageCreatedAt": -1 })
          .limit(1)
          .select("_id")
          .lean()) as { _id: string }[];

        userChatStatusObj.groupConversationStatus =
          getFirstGroupConversationId[0]._id;
      }
      res.status(200).json({
        message: {
          userChatStatusObj,
          userNotificationObj,
        },
      });
    } catch (err) {
      console.log(err);
    }
  }
);

export const searchUserResult = asyncHandler(
  async (req: Request, res: Response) => {
    const { search } = req.query;
    const getUserResult = await User.find({
      name: new RegExp(`${search}`, "i"),
    }).select(["name", "profilePic", "status"]);
    res.status(200).json({ message: getUserResult });
  }
);
export const getAllMail = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { filter } = req.query;
  const query: { to: string; isAlreadyRead?: boolean } = { to: userId };

  if (filter === "read") {
    query.isAlreadyRead = true;
  } else if (filter === "unread") {
    query.isAlreadyRead = false;
  }

  const getMail = await Mail.find(query)
    .sort({ sentAt: -1 })
    .select(["sentAt", "isAlreadyRead"]);
  res.status(200).json({ message: getMail });
});
export const updateMailStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const { mailId } = req.params;

    if (!mailId) {
      res.status(403);
      throw new Error("Forbidden");
    }
    await Mail.findByIdAndUpdate(mailId, {
      isAlreadyRead: true,
    });

    res.status(204);
  }
);

export const deleteMail = asyncHandler(async (req: Request, res: Response) => {
  const selectedMails: string[] = req.body;
  await Mail.deleteMany({ _id: { $in: selectedMails } });
  res.status(201).json({ message: "Deleted Successfully" });
});

export const getMailDetails = asyncHandler(
  async (req: Request, res: Response) => {
    const { userId, mailId } = req.params;

    if (!userId || !mailId) {
      res.status(403);
      throw new Error("Forbidden");
    }

    const getMailContent = await Mail.aggregate([
      {
        $match: { _id: new mongoose.Types.ObjectId(mailId) },
      },
      {
        $lookup: {
          from: "groupconversations",
          localField: "body",
          foreignField: "_id",
          as: "group_details",
        },
      },
      {
        $addFields: {
          group_details: { $first: "$group_details" },
        },
      },
      {
        $project: {
          kind: 1,
          from: 1,
          sentAt: 1,
          group_details: {
            groupName: 1,
            groupPhoto: 1,
            total_members: {
              $size: {
                $filter: {
                  input: "$group_details.members",
                  cond: { $eq: ["$$this.status", "active"] },
                },
              },
            },
          },
        },
      },
    ]);
    if (!getMailContent) {
      res.status(404);
      throw new Error("Mail does not exist");
    }
    res.status(200).json({ message: getMailContent[0] });
  }
);
