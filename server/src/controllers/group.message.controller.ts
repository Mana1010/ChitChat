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
    const { limit, page } = req.query;
    if (!page || !limit) {
      res.status(403);
      throw new Error("Forbidden");
    }
    const LIMIT = +limit;
    const PAGE = +page;
    const getAllGroups = await GroupConversation.aggregate([
      {
        $skip: PAGE * LIMIT,
      },
      {
        $limit: 10,
      },
      {
        $project: {
          groupName: 1,
          groupPhoto: 1,
          totalMember: { $size: "$members" },
        },
      },
    ]);
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
    console.log(getAllGroupChat);
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
