import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import { Group } from "../model/group.model";
import { GroupConversation } from "../model/groupConversation.model";
import mongoose from "mongoose";
import {
  CreateGroupSchema,
  createGroupSchemaValidation,
} from "../validations/createGroupSchema.validation";
import path from "path";
import {
  retrieveFileCloudinary,
  uploadFileCloudinary,
} from "../utils/cloudinary.utils";
import { appLogger } from "../utils/loggers.utils";

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
        $lookup: {
          from: "users",
          localField: "members.memberInfo",
          foreignField: "_id",
          as: "member_details",
        },
      },
      {
        $addFields: {
          filter_member_status: {
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
          filter_out_you: {
            $filter: {
              input: "$member_details",
              cond: {
                $ne: ["$$this._id", new mongoose.Types.ObjectId(userId)],
              },
            },
          },
        },
      },
      {
        $addFields: {
          user_group_status: {
            $cond: {
              if: { $ne: [{ $ifNull: ["$filter_member_status", null] }, null] },
              then: "$filter_member_status.status",
              else: "no-status",
            },
          },
          is_group_active: {
            $anyElementTrue: {
              $map: {
                input: "$filter_out_you",
                in: { $eq: ["$$this.status.type", "online"] },
              },
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
          is_group_active: 1,
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
        $lookup: {
          from: "users",
          localField: "lastMessage.sender",
          foreignField: "_id",
          as: "sender_details",
        },
      },
      {
        $addFields: {
          only_active_member: {
            $filter: {
              input: "$members",
              cond: { $eq: ["$$this.status", "active"] },
            },
          },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "only_active_member.memberInfo",
          foreignField: "_id",
          as: "member_details",
        },
      },
      {
        $addFields: {
          filter_out_you: {
            $filter: {
              input: "$member_details",
              cond: {
                $ne: ["$$this._id", new mongoose.Types.ObjectId(id)],
              },
            },
          },
        },
      },
      {
        $addFields: {
          is_group_active: {
            //This will check if there is atleast one user (excluded you) is online to be able to return true else false
            $anyElementTrue: {
              $map: {
                input: "$filter_out_you",
                in: { $eq: ["$$this.status.type", "online"] },
              },
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
          lastMessage: {
            sender: {
              _id: { $first: "$sender_details._id" },
              name: { $first: "$sender_details.name" },
            },
            text: 1,
            type: 1,
            lastMessageCreatedAt: 1,
          },
          updatedAt: 1,
          member_details: { $first: "$member_details" },
          is_group_active: 1,
        },
      },
    ]);
    res.status(200).json({ message: getAllGroupChat });
  }
);

export const createGroupChat = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      groupName,
      groupProfileIcon,
      creatorId,
      groupChatboardBackground,
    }: CreateGroupSchema = req.body;

    const validateData = createGroupSchemaValidation.safeParse(req.body);

    if (!validateData.success) {
      res.status(422);
      throw new Error("Validation Failed");
    }
    try {
      const retrieveGroupChatboardBg = await retrieveFileCloudinary(
        `Chitchat/group-chatboard-background/${groupChatboardBackground}`
      );

      const retrieveGroupProfile = await retrieveFileCloudinary(
        `Chitchat/group-chat-profile/${groupProfileIcon}`
      );

      const newGroupDetails = await GroupConversation.create({
        creator: creatorId,
        groupName,
        groupPhoto: retrieveGroupProfile,
        groupChatboardWallpaper: retrieveGroupChatboardBg,
        members: [
          {
            memberInfo: creatorId,
            role: "admin",
            status: "active",
          },
        ],
        lastMessage: {
          sender: creatorId,
          type: "system",
        },
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
    const { groupId, userId } = req.params;
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
          only_active_member: {
            $filter: {
              input: "$members",
              cond: { $eq: ["$$this.status", "active"] },
            },
          },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "only_active_member.memberInfo",
          foreignField: "_id",
          as: "member_details",
        },
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
          filter_out_you: {
            $filter: {
              input: "$member_details",
              cond: {
                $ne: ["$$this._id", new mongoose.Types.ObjectId(userId)],
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
          groupChatboardWallpaper: 1,
          createdAt: 1,
          is_group_active: {
            $anyElementTrue: {
              $map: {
                input: "$filter_out_you",
                in: { $eq: ["$$this.status.type", "online"] },
              },
            },
          },
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

export const groupChatDetails = asyncHandler(
  async (req: Request, res: Response) => {
    const { groupId, userId } = req.params;
    try {
      const group_details = await GroupConversation.aggregate([
        {
          $match: { _id: new mongoose.Types.ObjectId(groupId) },
        },
        {
          $addFields: {
            excluded_you: {
              $filter: {
                input: "$members",
                cond: {
                  $ne: [
                    "$$this.memberInfo",
                    new mongoose.Types.ObjectId(userId),
                  ],
                },
              },
            },
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "excluded_you.memberInfo",
            foreignField: "_id",
            as: "member_details",
          },
        },
        {
          $project: {
            total_active_member: {
              $size: {
                $filter: {
                  input: "$members",
                  cond: { $eq: ["$$this.status", "active"] },
                },
              },
            },
            is_group_active: {
              $anyElementTrue: {
                $map: {
                  input: "$member_details",
                  in: { $eq: ["$$this.status.type", "online"] },
                },
              },
            },
            groupName: 1,
            groupPhoto: 1,
            createdAt: 1,
            _id: 1,
          },
        },
      ]);
      res.status(200).json(group_details[0]);
    } catch (err) {
      console.log(err);
    }
  }
);

export const getGroupMembers = asyncHandler(
  async (req: Request, res: Response) => {
    const { groupId, userId } = req.params;
    const { member_status } = req.query;

    const user_role = await GroupConversation.findOne(
      {
        _id: groupId,
        "members.memberInfo": userId,
      },
      {
        "members.$": 1,
      }
    );
    const formatted_user_role = user_role.members[0].role;

    if (member_status !== "active" && formatted_user_role === "guest") {
      res.status(403);
      throw new Error("Only admin have access to this");
    }
    const group_member_list = await GroupConversation.aggregate([
      {
        $match: { _id: new mongoose.Types.ObjectId(groupId) },
      },
      {
        $unwind: "$members",
      },
      {
        $match: {
          "members.status": member_status,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "members.memberInfo",
          foreignField: "_id",
          as: "member_details",
        },
      },
      {
        $addFields: {
          member_details: {
            $map: {
              input: "$member_details",
              in: {
                _id: "$$this._id",
                role: "$members.role",
                name: "$$this.name",
                profilePic: "$$this.profilePic",
                status: "$$this.status",
              },
            },
          },
        },
      },
      {
        $project: {
          member_details: { $first: "$member_details" },
        },
      },
    ]);
    console.log(group_member_list);
    res.status(200).json(group_member_list);
  }
);
