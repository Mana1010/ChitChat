import { GroupConversation } from "../model/groupConversation.model";
import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import { Mail } from "../model/mail.model";
import mongoose from "mongoose";
import { User } from "../model/user.model";
import { PrivateConversation } from "../model/privateConversation.model";
import { appLogger } from "../utils/loggers.utils";

const handleUserJoinedGroupChatList = async (groupId: string) => {
  const result = await GroupConversation.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(groupId),
      },
    },
    { $limit: 1 },
    {
      $lookup: {
        from: "users",
        localField: "lastMessage.sender",
        foreignField: "_id",
        as: "sender_details",
      },
    },
    {
      $project: {
        groupName: 1,
        groupPhoto: 1,
        lastMessage: {
          sender: {
            name: { $first: "$sender_details.name" },
            _id: { $first: "$sender_details._id" },
          },
          text: 1,
          type: 1,
          lastMessageCreatedAt: 1,
        },
        is_group_active: true,
      },
    },
  ]);
  return result[0];
};
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
      $set: {
        "members.$.status": "active",
        "members.$.joinedAt": new Date(),
        "lastMessage.sender": userId,
        "lastMessage.text": "joined the group",
        "lastMessage.type": "system",
        "lastMessage.lastMessageCreatedAt": new Date(),
      },
    }
  );
  const groupChatDetails = await handleUserJoinedGroupChatList(groupId);
  await handleMailUpdate(groupId, userId, "accepted");
  return { groupChatDetails };
};

const handleDeclineInvitation = async (groupId: string, userId: string) => {
  await GroupConversation.findByIdAndUpdate(groupId, {
    $pull: {
      members: { memberInfo: userId },
    },
  });
  await handleMailUpdate(groupId, userId, "declined");
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
      $set: {
        "members.$.status": "active",
        "members.$.joinedAt": new Date(),
        "lastMessage.sender": requesterId,
        "lastMessage.text": "joined the group",
        "lastMessage.type": "system",
        "lastMessage.lastMessageCreatedAt": new Date(),
      },
    }
  );
  const groupChatDetails = await handleUserJoinedGroupChatList(groupId);
  await handleMailUpdate(groupId, userId, "accepted");
  return { groupChatDetails };
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
      const { groupChatDetails } = await handleAcceptInvitation(
        groupId,
        userId
      );
      res.status(201).json({
        message: "Invitation accepted successfully",
        groupId,
        groupChatDetails,
      });
    } catch (err) {
      console.log(err);
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
      const { groupChatDetails } = await handleAcceptRequest(
        groupId,
        userId,
        requesterId
      );
      res.status(201).json({
        message: "Request accepted successfully",
        groupId,
        requesterId,
        groupChatDetails,
      });
    } catch (err) {
      appLogger.error(err);
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
      console.log("Very Start Here");
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

export const participantProfile = asyncHandler(
  async (req: Request, res: Response) => {
    const { participantId } = req.params;
    try {
      const participant_details = await User.findById(participantId)
        .select("-authId")
        .lean();

      const total_participant_joined_group = await GroupConversation.find({
        members: {
          $elemMatch: {
            memberInfo: participantId,
            status: "active",
          },
        },
      }).countDocuments();

      const total_participant_private_chat = await PrivateConversation.find({
        participants: {
          $in: [participantId],
        },
      }).countDocuments();
      console.log("Done hehe");
      const responseData = {
        participant_details,
        total_participant_joined_group,
        total_participant_private_chat,
      };

      console.log(responseData);
      res.status(200).json(responseData);
    } catch (err) {
      console.log(err);
      res.status(400).json({ message: err });
    }
  }
);

export const chatUser = asyncHandler(async (req: Request, res: Response) => {
  const { senderId, receiverId } = req.body;
  if (!senderId || !receiverId) {
    res.status(401).json({ message: "Please provide senderId and receiverId" });
    return;
  }
  const checkExistingConversation = await PrivateConversation.findOne({
    participants: { $all: [senderId, receiverId] },
  });
  //Check first if the conversation already exist
  if (!checkExistingConversation) {
    const addConversation = await PrivateConversation.create({
      participants: [senderId, receiverId],
      lastMessage: {
        sender: senderId,
        type: "system",
      },
    });
    res.status(201).json({
      conversationId: addConversation._id,
      senderId,
      is_already_chatting: false,
    });
    return;
  }
  res.status(201).json({
    conversationId: checkExistingConversation._id,
    is_already_chatting: true,
  });
});
