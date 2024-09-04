import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import { Public } from "../model/public.model";
import { User } from "../model/user.model";
import { Conversation } from "../model/conversation.model";

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
      participants: { $in: [id] },
    }).populate<
      { _id: string; profilePic: string; name: string; status: string }[]
    >({
      path: "participants",
      select: ["profilePic", "name", "status"],
    });
    res.status(200).json({ message: getAllUsers });
  }
);
export const chatUser = asyncHandler(async (req: Request, res: Response) => {
  const { senderId, receiverId } = req.body; //userId is an id for the receiver

  const checkExistingConversation = await Conversation.findOne({
    participants: { $all: [senderId, receiverId] },
  });
  if (!checkExistingConversation) {
    const addConversation = await Conversation.create({
      userId: senderId,
      participants: [senderId, receiverId],
    });
    res.status(201).json({ message: addConversation._id });
    return;
  }
  res.status(201).json({ message: checkExistingConversation._id });
});
