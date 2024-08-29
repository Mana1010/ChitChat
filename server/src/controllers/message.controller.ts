import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import { Public } from "../model/public.model";

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
    console.log(getAllMessages);
    res.status(200).json({ message: getAllMessages });
  }
);
