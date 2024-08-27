import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import { Public } from "../model/public.model";

export const getAllPublicMessages = asyncHandler(
  async (req: Request, res: Response) => {
    console.log("Running the backend");
    const getAllMessages = await Public.find().populate({
      path: "userId",
      select: ["name", "profilePic"],
    });
    if (getAllMessages.length === 0) {
      res.status(200).json({ message: [] });
      return;
    }
    console.log(getAllMessages);
    res.status(200).json({ message: getAllMessages });
  }
);
