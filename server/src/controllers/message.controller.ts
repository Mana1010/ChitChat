import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import { Public } from "../model/public.model";
import { User } from "../model/user.model";
import { Conversation } from "../model/conversation.model";
import { Private } from "../model/private.model";
import { ObjectId } from "mongodb";
import mongoose from "mongoose";

export const getAllPublicMessages = asyncHandler(
  async (req: Request, res: Response) => {
    const { page, limit } = req.query;
    if (!page || !limit) {
      res.status(403);
      throw new Error("Forbidden");
    }
    const PAGE = +page;
    const LIMIT = +limit;
    const getAllMessages = await Public.find()
      .sort({ createdAt: -1 })
      .skip(PAGE * LIMIT)
      .limit(LIMIT)
      .populate({
        path: "userId",
        select: ["-createdAt", "-updatedAt", "-__v"],
      })
      .select(["message", "isMessageDeleted"]);
    const hasNextPage = getAllMessages.length === LIMIT;
    const nextPage = hasNextPage ? PAGE + 1 : null;
    res.status(200).json({
      message: {
        getAllMessages: getAllMessages.reverse(),
        nextPage,
      },
    });
  }
);
export const getAllUsers = asyncHandler(async (req: Request, res: Response) => {
  const { limit, page } = req.query;
  if (!page || !limit) {
    res.status(403);
    throw new Error("Forbidden");
  }
  const LIMIT = +limit;
  const PAGE = +page;
  const getAllUsers = await User.find()
    .select(["name", "profilePic", "status"])
    .sort({ status: -1 }) //Online to Offline
    .skip(PAGE * LIMIT)
    .limit(LIMIT);
  const hasNextPage = getAllUsers.length === LIMIT;
  const nextPage = hasNextPage ? PAGE + 1 : null;

  res.status(200).json({
    message: {
      getAllUsers,
      nextPage,
    },
  });
});
export const getAllUsersConversation = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const getAllUsers = await Conversation.aggregate([
      { $match: { participants: new mongoose.Types.ObjectId(id) } },
      { $unwind: "$participants" },
      {
        $match: { participants: { $ne: new mongoose.Types.ObjectId(id) } },
      },
      {
        $lookup: {
          from: "users",
          localField: "participants",
          foreignField: "_id",
          as: "receiver_details",
        },
      },
      {
        $sort: { "lastMessage.lastMessageCreatedAt": -1 },
      },
      {
        $project: {
          receiver_details: { $arrayElemAt: ["$receiver_details", 0] },
          _id: 1,
          lastMessage: 1,
          hasUnreadMessages: 1,
          updatedAt: 1,
        },
      },
    ]);
    res.status(200).json({ message: getAllUsers });
  }
);
export const chatUser = asyncHandler(async (req: Request, res: Response) => {
  const { senderId, receiverId } = req.body; //userId is an id for the receiver
  if (!senderId || !receiverId) {
    res.status(401).json({ message: "Please provide senderId and receiverId" });
    return;
  }
  const checkExistingConversation = await Conversation.findOne({
    participants: { $all: [senderId, receiverId] },
  });
  if (!checkExistingConversation) {
    const addConversation = await Conversation.create({
      participants: [senderId, receiverId],
    });
    res.status(201).json({ message: addConversation._id });
    return;
  }
  res.status(201).json({ message: checkExistingConversation._id });
});

export const getPrivateMessages = asyncHandler(
  async (req: Request, res: Response) => {
    const { conversationId } = req.params;
    const { page, limit } = req.query;
    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      res.status(404);
      throw new Error("User not found");
    }
    if (!page || !limit) {
      res.status(403);
      throw new Error("Forbidden");
    }
    const LIMIT = +limit;
    const CURRENTPAGE = +page;
    if (isFinite(CURRENTPAGE)) {
      const getMessages = await Private.find({ conversationId })
        .sort({ createdAt: -1 })
        .skip(CURRENTPAGE * LIMIT)
        .limit(LIMIT)
        .populate([
          { path: "sender", select: ["name", "profilePic", "status"] },
        ])
        .select(["sender", "message", "isRead", "createdAt", "reaction"]);
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
  }
);
export const getParticipantInfo = asyncHandler(
  async (req: Request, res: Response) => {
    const { userId, conversationId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      res.status(404);
      throw new Error("User not found");
    }

    const getUserInfo = await Conversation.aggregate([
      {
        $match: { _id: new mongoose.Types.ObjectId(conversationId) },
      },
      {
        $unwind: "$participants",
      },
      {
        $match: {
          participants: { $ne: new mongoose.Types.ObjectId(userId) },
        },
      },

      {
        $lookup: {
          from: "users",
          localField: "participants",
          foreignField: "_id",
          as: "receiver_details",
        },
      },
      {
        $addFields: {
          receiver_details: { $first: "$receiver_details" }, //Retrieve the chatmate's details from the array.
        },
      },
      {
        $project: {
          receiver_details: {
            name: "$receiver_details.name",
            _id: "$receiver_details._id",
            profilePic: "$receiver_details.profilePic",
            status: "$receiver_details.status",
            provider: "$receiver_details.provider",
            email: "$receiver_details.email",
          },
          hasUnreadMessages: 1,
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

export const getChatNotifications = asyncHandler(
  async (req: Request, res: Response) => {
    const { senderId } = req.params;
    const checkIfNewUser = await Conversation.findOne({
      participants: { $in: [senderId] },
    }); //Checking if the user has already a conversation or chatmate
    if (checkIfNewUser) {
      const getLatestConversationId = await Conversation.find({
        participants: { $in: [senderId] },
      })
        .sort({ "lastMessage.lastMessageCreatedAt": -1 })
        .limit(1)
        .select("_id"); //Will sort descending by updatedAt and get the very first index using limit
      res.status(200).json({ message: getLatestConversationId[0]._id });
      return;
    }

    res.status(200).json({ message: null }); //If the user is new and have no conversation made with other
  }
);
export const getParticipantName = asyncHandler(
  async (req: Request, res: Response) => {
    const { participantId, conversationId } = req.params;

    const getChatMateName = await Conversation.aggregate([
      {
        $match: { _id: new mongoose.Types.ObjectId(conversationId) },
      },
      {
        $unwind: "$participants",
      },
      {
        $match: {
          participants: { $ne: new mongoose.Types.ObjectId(participantId) },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "participants",
          foreignField: "_id",
          as: "participant_name",
        },
      },
      {
        $project: {
          participant_name: {
            name: "$participant_name.name",
          },
        },
      },
    ]);
    if (!getChatMateName) {
      res.status(404);
      throw new Error("User not found");
    }
    res
      .status(200)
      .json({ name: getChatMateName[0].participant_name[0].name[0] }); //Retrieving the participant's name
  }
);

export const searchUserResult = asyncHandler(
  async (req: Request, res: Response) => {
    const { search } = req.query;
    console.log(search);
    const getUserResult = await User.find({
      name: new RegExp(`${search}`, "i"),
    }).select(["name", "profilePic", "status"]);
    res.status(200).json({ message: getUserResult });
  }
);
