import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import { Public } from "../model/public.model";
import { User } from "../model/user.model";
import { Conversation } from "../model/conversation.model";
import { Private } from "../model/private.model";

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
  res
    .status(200)
    .json({ message: [...getAllOnlineUsers, ...getAllOfflineUsers] });
});
export const getAllUsersConversation = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const getAllUsers = await Conversation.find({
      sender: id,
    })
      .sort({ updatedAt: -1 })
      .populate<
        { _id: string; profilePic: string; name: string; status: string }[]
      >({
        path: "receiver",
        select: ["profilePic", "name", "status"],
      })
      .select(["lastMessage", "receiver"]);
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
    sender: senderId,
    receiver: receiverId,
  });
  if (!checkExistingConversation) {
    const addConversation = await Conversation.create({
      sender: senderId,
      receiver: receiverId,
    });
    res.status(201).json({ message: addConversation._id });
    return;
  }
  res.status(201).json({ message: checkExistingConversation._id });
});

export const getReceiverInfo = asyncHandler(
  async (req: Request, res: Response) => {
    const { conversationId } = req.params;
    const getUserInfo = await Conversation.findById(conversationId)
      .populate({
        path: "receiver",
        select: ["name", "status", "profilePic"],
      })
      .select(["receiver", "-_id"]);
    const getMessages = await Private.find({ conversationId });
    console.log(getUserInfo.receiver);
    res.status(200).json({
      message: {
        getUserInfo: getUserInfo.receiver,
        getMessages,
      },
    });
  }
);

export const getChatNotifications = asyncHandler(
  async (req: Request, res: Response) => {
    const { senderId } = req.params;
    const checkIfNewUser = await Conversation.findOne({ sender: senderId }); //Checking if the user already have a conversation or chatmate
    if (checkIfNewUser) {
      const getLatestConversationId = await Conversation.find({
        sender: senderId,
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
