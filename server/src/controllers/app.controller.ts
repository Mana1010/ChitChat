import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import { PrivateConversation } from "../model/privateConversation.model";
import { GroupConversation } from "../model/groupConversation.model";
import mongoose from "mongoose";
import { User } from "../model/user.model";
import { Mail } from "../model/mail.model";
import { appLogger } from "../utils/loggers.utils";

interface UserChatStatusObjSchema {
  privateConversationStatus: string | null;
  groupConversationStatus: string | null;
}
interface UserNotificationObjSchema {
  privateNotificationCount: string[];
  groupNotificationCount: string[];
  mailboxNotificationCount: number;
}
interface NotificationObjSchema {
  totalUnreadPrivateConversation: string[];
  totalUnreadMail: string[];
  totalUnreadGroupConversation: string[];
}
export const getSidebarNotificationAndCurrentConversation = asyncHandler(
  async (req: Request, res: Response) => {
    const { senderId } = req.params;
    const userChatStatusObj: UserChatStatusObjSchema = {
      privateConversationStatus: null,
      groupConversationStatus: null,
    };

    try {
      const checkIfNewUserPrivate = await PrivateConversation.exists({
        participants: { $in: [senderId] },
      });

      const handleNotificationQuery = await PrivateConversation.aggregate([
        {
          $match: {
            participants: {
              $in: [new mongoose.Types.ObjectId(senderId)],
            },
            userReadMessage: {
              $nin: [new mongoose.Types.ObjectId(senderId)],
            },
          },
        },
        {
          $group: {
            _id: null,
            totalUnreadPrivateConversation: { $push: "$_id" },
          },
        },
        {
          $project: {
            _id: 0,
            totalUnreadPrivateConversation: 1,
          },
        },
        {
          $unionWith: {
            coll: "mails",
            pipeline: [
              {
                $match: {
                  to: new mongoose.Types.ObjectId(senderId),
                  isAlreadyRead: false,
                },
              },
              {
                $group: {
                  _id: null,
                  totalUnreadMail: { $push: "$_id" },
                },
              },
              {
                $project: {
                  _id: 0,
                  totalUnreadMail: 1,
                },
              },
            ],
          },
        },
        {
          $unionWith: {
            coll: "groupconversations",
            pipeline: [
              {
                $match: {
                  member: {
                    $elemMatch: {
                      memberInfo: new mongoose.Types.ObjectId(senderId),
                      status: "active",
                    },
                  },
                  memberReadMessage: {
                    $nin: [new mongoose.Types.ObjectId(senderId)],
                  },
                },
              },
              {
                $group: {
                  _id: null,
                  totalUnreadGroupConversation: { $push: "$_id" },
                },
              },
              {
                $project: {
                  _id: 0,
                  totalUnreadGroupConversation: 1,
                },
              },
            ],
          },
        },
      ]);
      const keywords = [
        "totalUnreadPrivateConversation",
        "totalUnreadMail",
        "totalUnreadGroupConversation",
      ];
      let userNotificationObj: NotificationObjSchema = {
        totalUnreadPrivateConversation: [],
        totalUnreadGroupConversation: [],
        totalUnreadMail: [],
      };
      const result = Object.assign({}, ...handleNotificationQuery); //Format the result from [{}, {}] to {key1: value1, ...}

      keywords.forEach((key: string) => {
        userNotificationObj[key as keyof NotificationObjSchema] =
          result[key] ?? [];
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

export const deleteSingleMail = asyncHandler(
  async (req: Request, res: Response) => {
    const { mailId } = req.params;
    try {
      await Mail.deleteOne({ _id: mailId });
      res.status(201).json({ message: "Email deleted successfully." });
    } catch (err) {
      res
        .status(400)
        .json({ message: "Something went wrong, please try again" });
    }
  }
);
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
        $lookup: {
          from: "users",
          localField: "from",
          foreignField: "_id",
          as: "sender_details",
        },
      },
      {
        $addFields: {
          group_details: { $first: "$group_details" },
          sender_details: { $first: "$sender_details" },
        },
      },
      {
        $project: {
          kind: 1,
          status: 1,
          sentAt: 1,
          group_details: {
            _id: 1,
            groupName: 1,
            groupPhoto: 1,
            total_members: {
              $cond: {
                if: { $ifNull: ["$group_details", null] },
                then: {
                  $size: {
                    $filter: {
                      input: "$group_details.members",
                      cond: { $eq: ["$$this.status", "active"] },
                    },
                  },
                },
                else: 0,
              },
            },
          },
          sender_details: {
            name: 1,
            profilePic: 1,
            _id: 1,
          },
        },
      },
    ]);
    if (!getMailContent) {
      res.status(404);
      throw new Error("Mail does not exist");
    }
    appLogger.info({ message: getMailContent });
    res.status(200).json({ message: getMailContent[0] });
  }
);
export const getMailType = asyncHandler(async (req: Request, res: Response) => {
  const { mailId } = req.params;
  const getMail = await Mail.findById(mailId).select("kind");
  if (!getMail) {
    res.status(404);
    throw new Error("Mail not found!");
  }

  res.status(200).send(getMail.kind);
});
