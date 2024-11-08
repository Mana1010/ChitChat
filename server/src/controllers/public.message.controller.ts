import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import { Public } from "../model/public.model";
import mongoose from "mongoose";

export const getAllPublicMessages = asyncHandler(
  async (req: Request, res: Response) => {
    const { page, limit } = req.query;
    if (!page || !limit) {
      res.status(403);
      throw new Error("Forbidden");
    }
    const PAGE = +page;
    const LIMIT = +limit;
    const getAllMessages = await Public.find()
      .sort({ createdAt: -1 }) //Descending order of message
      .skip(PAGE * LIMIT)
      .limit(LIMIT)
      .populate({
        path: "sender",
        select: ["-createdAt", "-updatedAt", "-__v"],
      })
      .select(["message", "isMessageDeleted", "createdAt", "reactions"]);

    const hasNextPage = getAllMessages.length === LIMIT;
    const nextPage = hasNextPage ? PAGE + 1 : null;
    res.status(200).json({
      message: {
        getAllMessages: getAllMessages.reverse(),
        nextPage,
      },
    });
  }
);

export const getPublicReactionList = asyncHandler(
  async (req: Request, res: Response) => {
    const { messageId } = req.params;
    if (!messageId || messageId === "null") return;

    const getAllMessageReaction = await Public.aggregate([
      {
        $match: { _id: new mongoose.Types.ObjectId(messageId) },
      },
      {
        $unwind: "$reactions",
      },
      {
        $lookup: {
          from: "users",
          localField: "reactions.reactor",
          foreignField: "_id",
          as: "reactor_details",
        },
      },
      {
        $addFields: { reactor_details: { $first: "$reactor_details" } },
      },
      {
        $project: {
          reactions: 1,
          reactor_details: {
            name: 1,
            profilePic: 1,
          },
        },
      },
    ]);
    res.status(200).json({ message: getAllMessageReaction });
  }
);
