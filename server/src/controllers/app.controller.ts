import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import { Conversation } from "../model/conversation.model";
import { GroupConversation } from "../model/groupConversation.model";
import mongoose from "mongoose";
import { User } from "../model/user.model";
interface HandleAggregationSchema {
  handlePrivateConversation: {
    length: number;
    _id: string | null;
  };
  handleGroupConversation: {
    length: number;
    _id: string | null;
  };
}
interface UserChatStatusObjSchema {
  privateConversationStatus: string | null;
  groupConversationStatus: string | null;
}
async function handleAggregation(
  senderId: string
): Promise<HandleAggregationSchema> {
  const handlePrivateAggregation = await Conversation.aggregate([
    {
      $facet: {
        checkIfNewUserPrivate: [
          {
            $match: {
              participants: { $in: [new mongoose.Types.ObjectId(senderId)] },
            },
          },
          {
            $limit: 1,
          },
        ],
        getLatestPrivateConversationId: [
          {
            $match: {
              participants: { $in: [new mongoose.Types.ObjectId(senderId)] },
            },
          },
          {
            $sort: { "lastMessage.lastMessageCreatedAt": -1 }, //Will sort descending by updatedAt and get the very first index using limit
          },
          {
            $limit: 1,
          },
        ],
      },
    },
  ]);

  const handleGroupAggregation = await GroupConversation.aggregate([
    {
      $facet: {
        checkIfNewUserGroup: [
          {
            $match: {
              "members.memberInfo": new mongoose.Types.ObjectId(senderId),
            },
          },
          {
            $limit: 1,
          },
        ],
        getLatestGroupConversationId: [
          {
            $match: {
              "members.memberInfo": new mongoose.Types.ObjectId(senderId),
            },
          },
          {
            $sort: { "lastMessage.lastMessageCreatedAt": -1 }, //Will sort descending by updatedAt and get the very first index using limit
          },
          {
            $limit: 1,
          },
        ],
      },
    },
  ]);
  const doesHavePrivateConversation =
    handlePrivateAggregation[0].checkIfNewUserPrivate.length;
  const doesHaveGroupConversation =
    handleGroupAggregation[0].checkIfNewUserGroup.length;

  return {
    handlePrivateConversation: {
      length: handlePrivateAggregation[0].checkIfNewUserPrivate.length,
      _id: doesHavePrivateConversation
        ? handlePrivateAggregation[0].getLatestPrivateConversationId[0]._id.toString() //Converting from mongoose Type ObjectId to string
        : null,
    },
    handleGroupConversation: {
      length: handleGroupAggregation[0].checkIfNewUserGroup.length,
      _id: doesHaveGroupConversation
        ? handleGroupAggregation[0].getLatestGroupConversationId[0]._id.toString() //Converting from mongoose Type ObjectId to string
        : null,
    },
  };
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
      const { handlePrivateConversation, handleGroupConversation } =
        await handleAggregation(senderId);

      //User conversation status in private.
      //Checking if the user has already a conversation or chatmate
      if (handlePrivateConversation.length) {
        userChatStatusObj.privateConversationStatus =
          handlePrivateConversation._id;
      }
      if (handleGroupConversation.length) {
        userChatStatusObj.groupConversationStatus = handleGroupConversation._id;
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
  const getMail = await User.aggregate([
    {
      $match: { _id: new mongoose.Types.ObjectId(userId) },
    },
    {
      $unwind: "$mail",
    },
    {
      $project: {
        mail: {
          isAlreadyRead: 1,
          status: 1,
          sentAt: 1,
          _id: 1,
        },
        _id: -1,
      },
    },
    {
      $sort: { "mail.sentAt": -1 },
    },
  ]);
  console.log(getMail);
  res.status(200).json({ message: getMail });
});

export const updateMailStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const { userId, mailId } = req.params;

    if (!userId || !mailId) {
      res.status(403);
      throw new Error("Forbidden");
    }
    await User.findOneAndUpdate(
      {
        _id: userId,
        "mail._id": mailId,
      },
      {
        $set: { "mail.$.isAlreadyRead": true },
      }
    );
    res.status(204);
  }
);

export const getMailDetails = asyncHandler(
  async (req: Request, res: Response) => {
    const { userId, mailId } = req.params;
    if (!userId || !mailId) {
      res.status(403);
      throw new Error("Forbidden");
    }

    const getMail = await User.aggregate([
      {
        $match: { _id: new mongoose.Types.ObjectId(userId) },
      },
      {
        $unwind: "$mail",
      },
      {
        $match: { "mail._id": new mongoose.Types.ObjectId(mailId) },
      },
      {
        $lookup: {
          from: "groupconversations",
          localField: "mail.body",
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
          group_details: {
            total_member: { $size: "$group_details.members" },
            groupName: 1,
            groupPhoto: 1,
          },
          createdAt: 1,
        },
      },
    ]);
    res.status(200).json({ message: getMail[0] });
  }
);
