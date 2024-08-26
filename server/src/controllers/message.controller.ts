import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import { Public } from "../model/public.model";
export const getAllPublicMessages = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const getAllMessages = await Public.find().populate({
      path: "User",
      select: ["name", "profilePic"],
    });
    console.log(getAllMessages);
    res.status(200).json({ message: getAllMessages });
  }
);
