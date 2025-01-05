import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import { User } from "../model/user.model";
import { Message } from "../model/mail.model";

export const createUser = asyncHandler(async (req: Request, res: Response) => {
  const userId = await User.create(req.body);
  await Message.create({ to: userId, status: "none" });
  res.status(201).json({ message: "Log in successfully" });
});

export const checkUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!id) {
    res.status(403);
    throw new Error("Forbidden"); //If no id provided then forbidde
  }
  const checkUserExist = await User.findOne({ authId: id });
  if (!checkUserExist) {
    res.status(404).json({ message: null, status: "not-exist" });
    return;
  }
  res.status(200).json({ message: checkUserExist, status: "exist" });
});
