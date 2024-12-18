import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import { PrivateConversation } from "../model/privateConversation.model";
import { GroupConversation } from "../model/groupConversation.model";
import mongoose from "mongoose";
import { User } from "../model/user.model";
import { Invitation, Mail } from "../model/mail.model";
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
export const getSidebarNotificationAndCurrentConversation = asyncHandler(
  async (req: Request, res: Response) => {
    const { senderId } = req.params;
    const userChatStatusObj: UserChatStatusObjSchema = {
      privateConversationStatus: null,
      groupConversationStatus: null,
    };

    const userNotificationObj: UserNotificationObjSchema = {
      privateNotificationCount: [],
      groupNotificationCount: [],
      mailboxNotificationCount: 0,
    };

    try {
      const checkIfNewUserPrivate = await PrivateConversation.exists({
        participants: { $in: [senderId] },
      });

      const getTotalPrivateNotification = (await PrivateConversation.find({
        participants: { $in: [senderId] },
        userReadMessage: { $nin: [senderId] },
      })
        .select(["_id"])
        .lean()) as { _id: string }[];

      const getTotalMailNotification = await Mail.find({
        to: senderId,
        isAlreadyRead: false,
      }).countDocuments();
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

        for (let i = 0; i < getTotalPrivateNotification.length; i++) {
          userNotificationObj.privateNotificationCount.push(
            getTotalPrivateNotification[i]._id.toString()
          );
        }
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

      if (getTotalMailNotification > 0) {
        userNotificationObj.mailboxNotificationCount = getTotalMailNotification;
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

export const deleteMultipleMail = asyncHandler(
  async (req: Request, res: Response) => {
    const selectedMails: string[] = req.body;
    await Mail.deleteMany({ _id: { $in: selectedMails } });
    res.status(201).json({ message: "Deleted Successfully" });
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
