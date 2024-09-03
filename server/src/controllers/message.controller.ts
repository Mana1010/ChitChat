import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import { Public } from "../model/public.model";
import { User } from "../model/user.model";

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
  ]);
  const getAllOfflineUsers = await User.find({ status: "Offline" }).select([
    "name",
    "profilePic",
  ]);
  res
    .status(200)
    .json({ message: [...getAllOnlineUsers, ...getAllOfflineUsers] });
});
export const getAllUsersConversation = asyncHandler(
  async (req: Request, res: Response) => {
    const getAllUsers = await User.find();
    res.status(200).json({ message: getAllUsers });
  }
);
