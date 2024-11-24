import { GroupConversation } from "../model/groupConversation.model";
import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import { Mail } from "../model/mail.model";
import mongoose from "mongoose";
import { Group } from "../model/group.model";

export const acceptInvitation = asyncHandler(
  async (req: Request, res: Response) => {
    const { groupId, userId } = req.params;
    console.log(groupId, userId);

    await GroupConversation.updateOne(
      {
        _id: new mongoose.Types.ObjectId(groupId),
        "members.memberInfo": new mongoose.Types.ObjectId(userId),
      },
      {
        $set: { "members.$.status": "active" },
      }
    );
    await Mail.updateOne(
      {
        body: new mongoose.Types.ObjectId(groupId),
        to: new mongoose.Types.ObjectId(userId),
        status: "pending",
      },
      {
        $set: { status: "accepted" },
      }
    );
    res.status(200).json({
      message: "Invitation accepted successfully",
      groupId,
    });
  }
);

export const declineInvitation = asyncHandler(
  async (req: Request, res: Response) => {
    const { groupId, userId } = req.params;
    console.log(groupId, userId);
    await GroupConversation.findByIdAndUpdate(groupId, {
      $pull: {
        members: { memberInfo: userId },
      },
    });

    await Mail.updateOne(
      {
        body: new mongoose.Types.ObjectId(groupId),
        to: new mongoose.Types.ObjectId(userId),
        status: "pending",
      },
      {
        $set: { status: "declined" },
      }
    );
    res.status(200).json({
      message: "Invitation declined successfully",
      type: "declined",
    });
  }
);
