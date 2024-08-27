import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import { User } from "../model/user.model";
export const createUser = asyncHandler(async (req: Request, res: Response) => {
  await User.create(req.body);
  res.status(201).json({ message: "Log in successfully" });
});

export const checkUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  console.log(id);
  const checkUserExist = await User.findOne({ authId: id });

  res.status(200).json({ message: checkUserExist });
});
