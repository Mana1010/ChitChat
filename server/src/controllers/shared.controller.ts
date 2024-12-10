import { GroupConversation } from "../model/groupConversation.model";
import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import { Mail } from "../model/mail.model";
import mongoose from "mongoose";
import { string } from "zod";

const handleMailUpdate = async (
  groupId: string,
  userId: string,
  status: "accepted" | "declined"
) => {
  await Mail.updateOne(
    {
      body: new mongoose.Types.ObjectId(groupId),
      to: new mongoose.Types.ObjectId(userId),
      status: "pending",
    },
    {
      $set: { status },
    }
  );
};
const handleAcceptInvitation = async (groupId: string, userId: string) => {
  await GroupConversation.updateOne(
    {
      _id: new mongoose.Types.ObjectId(groupId),
      "members.memberInfo": new mongoose.Types.ObjectId(userId),
    },
    {
      $set: { "members.$.status": "active" },
    }
  );
  await handleMailUpdate(groupId, userId, "accepted");
};

const handleDeclineInvitation = async (groupId: string, userId: string) => {
  await GroupConversation.findByIdAndUpdate(groupId, {
    $pull: {
      members: { memberInfo: userId },
    },
  });
};

const handleAcceptRequest = async (
  groupId: string,
  userId: string,
  requesterId: string
) => {
  await GroupConversation.updateOne(
    {
      _id: new mongoose.Types.ObjectId(groupId),
      "members.memberInfo": new mongoose.Types.ObjectId(requesterId),
    },
    {
      $set: { "members.$.status": "active" },
    }
  );
  await handleMailUpdate(groupId, userId, "accepted");
};

const handleDeclineRequest = async (
  groupId: string,
  userId: string,
  requesterId: string
) => {
  await GroupConversation.findByIdAndUpdate(groupId, {
    $pull: {
      members: { memberInfo: requesterId },
    },
  });
  await handleMailUpdate(groupId, userId, "declined");
};

export const acceptInvitation = asyncHandler(
  async (req: Request, res: Response) => {
    const { groupId, userId } = req.params;
    try {
      await handleAcceptInvitation(groupId, userId);
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
      await handleDeclineInvitation(groupId, userId);
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
    const { groupId, userId, requesterId } = req.params;
    try {
      await handleAcceptRequest(groupId, userId, requesterId);
      res.status(201).json({
        message: "Request accepted successfully",
        groupId,
        requesterId,
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
    const { groupId, userId, requesterId } = req.params;
    try {
      await handleDeclineRequest(groupId, userId, requesterId);
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
