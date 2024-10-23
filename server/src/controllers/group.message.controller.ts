import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import { Group } from "../model/group.model";
import { GroupConversation } from "../model/groupConversation.model";

export const getUserGroupChatStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const { senderId } = req.params;
    const checkIfNewUser = await Group.findOne({
      members: { $in: [senderId] },
    }); //Checking if the user has already a conversation or chatmate
    if (checkIfNewUser) {
      const getLatestConversationId = await Group.find({
        participants: { $in: [senderId] },
      })
        .sort({ "lastMessage.lastMessageCreatedAt": -1 })
        .limit(1) //Will sort descending by updatedAt and get the very first index using limit
        .select("_id");
      res.status(200).json({ message: getLatestConversationId[0]._id });
      return;
    }
    res.status(200).json({ message: null }); //If the user is new and have no conversation made with other
  }
);

export const getAllGroups = asyncHandler(
  async (req: Request, res: Response) => {
    const { limit, page } = req.query;
    if (!page || !limit) {
      res.status(403);
      throw new Error("Forbidden");
    }
    const LIMIT = +limit;
    const PAGE = +page;
    const getAllGroups = await GroupConversation.find()
      .select(["groupName", "groupPhoto"])
      .skip(PAGE * LIMIT)
      .limit(LIMIT);
    const hasNextPage = getAllGroups.length === LIMIT;
    const nextPage = hasNextPage ? PAGE + 1 : null;
    res.status(200).json({
      message: {
        getAllGroups,
        nextPage,
      },
    });
  }
);

export const searchGroupResult = asyncHandler(
  async (req: Request, res: Response) => {
    const { search } = req.query;
    const getGroupResult = await GroupConversation.find({
      groupName: new RegExp(`${search}`, "i"),
    }).select(["groupName", "groupPhoto"]);
    res.status(200).json({ message: getGroupResult });
  }
);
