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
              members: {
                $elemMatch: {
                  memberInfo: new mongoose.Types.ObjectId(senderId),
                },
              },
            },
          },
          {
            $limit: 1,
          },
        ],
        getLatestGroupConversationId: [
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
