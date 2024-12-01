import { GroupConversation } from "../model/groupConversation.model";
import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import { Mail } from "../model/mail.model";
import mongoose from "mongoose";

const handleAccept = async (groupId: string, userId: string) => {
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
};

const handleDecline = async (groupId: string, userId: string) => {
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
};

export const acceptInvitation = asyncHandler(
  async (req: Request, res: Response) => {
    const { groupId, userId } = req.params;
    try {
      await handleAccept(groupId, userId);
      res.status(201).json({
        message: "Invitation accepted successfully",
        groupId,
      });
    } catch (err) {
      res.status(400).json({
        message: "Failed to accept invitation",
      });
    }
  }
);

export const declineInvitation = asyncHandler(
  async (req: Request, res: Response) => {
    const { groupId, userId } = req.params;
    try {
      await handleDecline(groupId, userId);
      res.status(201).json({
        message: "Invitation declined successfully",
        groupId,
      });
    } catch (err) {
      res.status(400).json({
        message: "Failed to decline invitation",
      });
    }
  }
);

export const acceptRequest = asyncHandler(
  async (req: Request, res: Response) => {
    const { groupId, userId } = req.params;
    try {
      await handleAccept(groupId, userId);
      res.status(201).json({
        message: "Request accepted successfully",
        groupId,
      });
    } catch (err) {
      res.status(400).json({
        message: "Failed to accept request",
      });
    }
  }
);

export const declineRequest = asyncHandler(
  async (req: Request, res: Response) => {
    const { groupId, userId } = req.params;
    try {
      await handleDecline(groupId, userId);
      res.status(201).json({
        message: "Request declined successfully",
        groupId,
      });
    } catch (err) {
      res.status(400).json({
        message: "Failed to decline request",
      });
    }
  }
);
