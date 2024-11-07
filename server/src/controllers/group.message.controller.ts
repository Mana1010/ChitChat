import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import { Group } from "../model/group.model";
import { GroupConversation } from "../model/groupConversation.model";
import mongoose from "mongoose";
import { getAllUsersConversation } from "./private.message.controller";
import express from "express";
import {
  CreateGroupSchema,
  createGroupSchemaValidation,
} from "../validations/createGroupSchema.validation";
import path from "path";
import { uploadFileCloudinary } from "../utils/cloudinary.utils";

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
    const { limit, page, sort } = req.query;
    const { userId } = req.params;
    if (!page || !limit) {
      res.status(403);
      throw new Error("Forbidden");
    }
    const LIMIT = +limit;
    const PAGE = +page;
    const getAllGroups = await GroupConversation.aggregate([
      {
        $match: {
          $or: [
            {
              "members.memberInfo": {
                $ne: new mongoose.Types.ObjectId(userId),
              },
            },
            {
              members: {
                $elemMatch: {
                  memberInfo: new mongoose.Types.ObjectId(userId),
                  status: "pending",
                },
              },
            },
          ],
        },
      },
      {
        $addFields: {
          totalMember: { $size: "$members" },
        },
      },
      {
        $sort: {
          totalMember: -1,
        },
      },
      {
        $skip: PAGE * LIMIT,
      },
      {
        $limit: 10,
      },
      {
        $addFields: {
          is_user_pending: {
            $filter: {
              input: "$members",
              cond: {},
            },
          },
        },
      },
      {
        $project: {
          groupName: 1,
          groupPhoto: 1,
          totalMember: 1,
          members: 1,
        },
      },
    ]);
    console.log(getAllGroups);
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

export const getAllGroupChatConversation = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const getAllGroupChat = await GroupConversation.aggregate([
      {
        $match: {
          "members.memberInfo": new mongoose.Types.ObjectId(id),
        },
      },
      {
        $sort: { "lastMessage.lastMessageCreatedAt": -1 },
      },
      {
        $project: {
          groupName: 1,
          groupPhoto: 1,
          _id: 1,
          lastMessage: 1,
          hasUnreadMessages: 1,
          updatedAt: 1,
        },
      },
    ]);
    res.status(200).json({ message: getAllGroupChat });
  }
);

export const createGroupChat = asyncHandler(
  async (req: Request, res: Response) => {
    const { groupName, groupProfileIcon, creatorId }: CreateGroupSchema =
      req.body;
    const validateData = createGroupSchemaValidation.safeParse(req.body);

    if (!validateData.success) {
      res.status(422);
      throw new Error("Validation Failed");
    }

    const groupIcon = path.join(
      process.cwd(),
      "public",
      "assets",
      "images",
      "group-profile",
      `${groupProfileIcon}.png`
    );

    try {
      const uploadedPhotoDetails = await uploadFileCloudinary(
        groupIcon,
        "groupchat-profile"
      );
      const newGroupDetails = await GroupConversation.create({
        creator: creatorId,
        groupName,
        groupPhoto: {
          publicId: uploadedPhotoDetails.public_id,
          photoUrl: uploadedPhotoDetails.secure_url,
        },
        members: [
          {
            memberInfo: creatorId,
            role: "admin",
            status: "active",
          },
        ],
      });
      res.status(200).json({
        message: {
          content: "Successfully created your group",
          groupId: newGroupDetails._id,
        },
      });
    } catch (err: unknown) {
      console.log(err);
      res
        .status(400)
        .json({ message: "Something went wrong, please try again" });
    }
  }
);

export const getGroupChatInfo = asyncHandler(
  async (req: Request, res: Response) => {
    const { groupId } = req.params;
    console.log(groupId);
    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      res.status(404);
      throw new Error("User not found");
    }

    const getUserInfo = await GroupConversation.aggregate([
      {
        $match: { _id: new mongoose.Types.ObjectId(groupId) },
      },
      {
        $addFields: {
          total_member: {
            $size: {
              $filter: {
                input: "$members",
                cond: { $eq: ["$$this.status", "active"] }, //Retrieve the active member only.
              },
            },
          },
        },
      },
      {
        $project: {
          groupName: 1,
          groupPhoto: 1,
          total_member: 1,
          createdAt: 1,
        },
      },
    ]);

    if (!getUserInfo) {
      res.status(404);
      throw new Error("User not found");
    }
    console.log(getUserInfo);
    res.status(200).json({
      message: getUserInfo[0],
    });
  }
);

export const getGroupMessages = asyncHandler(
  async (req: Request, res: Response) => {
    const { groupId } = req.params;
    const { page, limit } = req.query;
    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      res.status(404);
      throw new Error("Conversation does not exist");
    }
    const checkConversationAvailability = await GroupConversation.findById(
      groupId
    );
    if (!checkConversationAvailability) {
      res.status(404);
      throw new Error("Conversation does not exist");
    }
    if (!page || !limit) {
      res.status(403);
      throw new Error("Forbidden");
    }
    const LIMIT = +limit;
    const CURRENTPAGE = +page;
    const getMessages = await Group.find({ groupId })
      .sort({ createdAt: -1 })
      .skip(CURRENTPAGE * LIMIT)
      .limit(LIMIT)
      .populate([{ path: "sender", select: ["name", "profilePic", "status"] }])
      .select(["sender", "message", "isRead", "createdAt", "reaction"]);
    const hasMoreMessages = getMessages.length === LIMIT;
    const messages = getMessages.reverse();
    const nextPage = hasMoreMessages ? CURRENTPAGE + 1 : null;
    console.log(getMessages);
    res.status(200).json({
      message: {
        getMessages: messages,
        nextPage,
      },
    });
  }
);
