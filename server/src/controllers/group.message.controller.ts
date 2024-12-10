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
        //this pipeline, lets first match the group that you have not a
        // member yet or the group that you are not a member but it has a pending invitation from you
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
                  status: { $ne: "active" },
                },
              },
            },
          ],
        },
      },
      {
        //this pipeline, we are counting the total active members each group to display the total member
        $addFields: {
          totalMember: {
            $size: {
              $filter: {
                input: "$members",
                cond: { $eq: ["$$this.status", "active"] },
              },
            },
          },
        },
      },
      //this three pipeline, is for sorting, skipping the page based on the user scroll and limit it only with 10
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
          user_group_status: {
            $arrayElemAt: [
              {
                $filter: {
                  input: "$members",
                  cond: {
                    $and: [
                      {
                        $in: ["$$this.status", ["pending", "requesting"]],
                      },
                      {
                        $eq: [
                          "$$this.memberInfo",
                          new mongoose.Types.ObjectId(userId),
                        ],
                      },
                    ],
                  },
                  limit: 1,
                },
              },
              0,
            ],
          },
        },
      },
      {
        $addFields: {
          user_group_status: {
            $cond: {
              if: { $ne: [{ $ifNull: ["$user_group_status", null] }, null] },
              then: "$user_group_status.status",
              else: "no-status",
            },
          },
        },
      },
      {
        $project: {
          groupName: 1,
          groupPhoto: 1,
          totalMember: 1,
          user_group_status: 1,
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
          members: {
            $elemMatch: {
              memberInfo: new mongoose.Types.ObjectId(id),
              status: "active",
            },
          },
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
      await Group.create({
        groupId: newGroupDetails._id,
        sender: creatorId,
        type: "system",
        message: "created this group",
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
      .select(["sender", "message", "createdAt", "reaction", "type"]);
    const hasMoreMessages = getMessages.length === LIMIT;
    const messages = getMessages.reverse();
    const nextPage = hasMoreMessages ? CURRENTPAGE + 1 : null;
    res.status(200).json({
      message: {
        getMessages: messages,
        nextPage,
      },
    });
  }
);

export const joinGroup = asyncHandler(async (req: Request, res: Response) => {
  const { userId, groupId } = req.params;
  await GroupConversation.findByIdAndUpdate(groupId, {
    $push: {
      members: {
        memberInfo: userId,
        status: "requesting",
      },
    },
  });
  res
    .status(201)
    .json({ message: "Successfully request to join the group", groupId });
});
