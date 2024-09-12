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
    const getAllMessages = await Public.find()
      .populate({
        path: "userId",
        select: ["-createdAt", "-updatedAt", "-__v"],
      })

      .select(["message", "isMessageDeleted"]);
    if (getAllMessages.length === 0) {
      res.status(200).json({ message: [] });
      return;
    }
    res.status(200).json({ message: getAllMessages });
  }
);
export const getAllUsers = asyncHandler(async (req: Request, res: Response) => {
  const getAllOnlineUsers = await User.find({ status: "Online" }).select([
    "name",
    "profilePic",
    "status",
  ]);
  const getAllOfflineUsers = await User.find({ status: "Offline" }).select([
    "name",
    "profilePic",
    "status",
  ]);

  // const getAllUsers = await User.aggregate([
  //   {
  //     $group: {
  //       _id: "$status",
  //       allUsers: {
  //         $push: {
  //           _id: "$_id",
  //           name: "$name",
  //           profilePic: "$profilePic",
  //           status: "$status",
  //         },
  //       },
  //     },
  //   },
  //   {
  //     $sort: {
  //       _id: -1, //Sort it based on the status (online to offline) but it will really sort out based on alphabetically
  //     },
  //   },
  //   {
  //     $group: {
  //       _id: null,
  //       userStatuses: { $push: "$allUsers" },
  //     },
  //   },
  //   {
  //     $project: {
  //       _id: 0,
  //       userStatuses: 1,
  //     },
  //   },
  // ]);
  res.status(200).json({
    message: [...getAllOnlineUsers, ...getAllOfflineUsers],
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
        $sort: { updatedAt: -1 },
      },

      {
        $project: {
          receiver_details: { $arrayElemAt: ["$receiver_details", 0] },
          _id: 1,
          lastMessage: 1,
          shouldUnwind: 1,
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

export const getReceiverInfo = asyncHandler(
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
          },
        },
      },
    ]);
    if (!getUserInfo) {
      res.status(404);
      throw new Error("User not found");
    }
    const getMessages = await Private.find({ conversationId })
      .populate([{ path: "sender", select: ["name", "profilePic", "status"] }])
      .select(["sender", "message", "isRead"]);
    res.status(200).json({
      message: {
        getUserInfo: getUserInfo[0],
        getMessages,
      },
    });
  }
);

export const getChatNotifications = asyncHandler(
  async (req: Request, res: Response) => {
    const { senderId } = req.params;
    const checkIfNewUser = await Conversation.findOne({
      participants: { $in: [senderId] },
    }); //Checking if the user already have a conversation or chatmate
    if (checkIfNewUser) {
      const getLatestConversationId = await Conversation.find({
        participants: { $in: [senderId] },
      })
        .sort({ updatedAt: -1 })
        .limit(1)
        .select("_id"); //Will sort descending by updatedAt and get the very first index using limit
      res.status(200).json({ message: getLatestConversationId[0]._id });
      return;
    }

    res.status(200).json({ message: null }); //If the user is new and have no conversation made with other
  }
);
