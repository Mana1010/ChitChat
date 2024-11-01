import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import { User } from "../model/user.model";
import { Conversation } from "../model/conversation.model";
export const createUser = asyncHandler(async (req: Request, res: Response) => {
  const userId = await User.create(req.body);
  await Conversation.create({ userId: userId._id });
  res.status(201).json({ message: "Log in successfully" });
});

export const checkUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!id) {
    res.status(403);
    throw new Error("Forbidden"); //If no id provided then forbidden
  }
  const checkUserExist = await User.findOne({ authId: id });
  res.status(200).json({ message: checkUserExist });
});
