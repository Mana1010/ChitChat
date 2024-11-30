import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import { User } from "../model/user.model";
import { Private } from "../model/private.model";
import { PrivateConversation } from "../model/privateConversation.model";
import mongoose from "mongoose";
import { groupLogger } from "../utils/loggers.utils";

export const getAllUsers = asyncHandler(async (req: Request, res: Response) => {
  const { limit, page } = req.query;
  const { userId } = req.params;
  if (!page || !limit) {
    res.status(403);
    throw new Error("Forbidden");
  }
  const LIMIT = +limit;
  const PAGE = +page;
  const getAllUsers = await User.find({ _id: { $ne: userId } })
    .select(["name", "profilePic", "status"])
    .sort({ status: -1 }) //Online to Offline
    .skip(PAGE * LIMIT)
    .limit(LIMIT);
  const hasNextPage = getAllUsers.length === LIMIT;
  const nextPage = hasNextPage ? PAGE + 1 : null;

  res.status(200).json({
    message: {
      getAllUsers,
      nextPage,
    },
  });
});

export const getAllUsersConversation = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
      const getAllConversation = await PrivateConversation.aggregate([
        {
          $match: { participants: { $in: [new mongoose.Types.ObjectId(id)] } },
        },
        { $unwind: "$participants" },
        {
          $match: { participants: { $ne: new mongoose.Types.ObjectId(id) } },
        },
        {
          $lookup: {
            from: "users",
            localField: "participants",
            foreignField: "_id",
            as: "receiver_details",
          },
        },
        {
          $sort: { "lastMessage.lastMessageCreatedAt": -1 },
        },
        {
          $addFields: {
            already_read_message: {
              $cond: {
                if: {
                  $in: [new mongoose.Types.ObjectId(id), "$userReadMessage"], //Will check if user is already
                },
                then: true,
                else: false,
              },
            },
          },
        },
        {
          $project: {
            receiver_details: { $first: "$receiver_details" },
            _id: 1,
            lastMessage: 1,
            updatedAt: 1,
            already_read_message: 1,
          },
        },
      ]);
      res.status(200).json({ message: getAllConversation });
    } catch (err) {
      groupLogger.error(err);
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
      receiverId,
      is_already_chatting: false,
    });
    return;
  }
  res.status(201).json({
    conversationId: checkExistingConversation._id,
    is_already_chatting: true,
  });
});

export const getPrivateMessages = asyncHandler(
  async (req: Request, res: Response) => {
    const { conversationId } = req.params;
    const { page, limit } = req.query;
    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      res.status(404);
      throw new Error("Conversation does not exist");
    }
    const checkConversationAvailability = await PrivateConversation.findById(
      conversationId
    );
    if (!checkConversationAvailability) {
      res.status(404);
      throw new Error("Conversation does not exist");
    }
    if (!page || !limit) {
      res.status(403);
      throw new Error("Forbidden");
    }
    const LIMIT = +limit;
    const CURRENTPAGE = +page;
    const getMessages = await Private.find({ conversationId })
      .sort({ createdAt: -1 })
      .skip(CURRENTPAGE * LIMIT)
      .limit(LIMIT)
      .populate([{ path: "sender", select: ["name", "profilePic", "status"] }])
      .select(["sender", "message", "createdAt", "reactions"]);
    const hasMoreMessages = getMessages.length === LIMIT;
    const messages = getMessages.reverse();
    const nextPage = hasMoreMessages ? CURRENTPAGE + 1 : null;

    res.status(200).json({
      message: {
        getMessages: messages,
        nextPage,
      },
    });
  }
);

export const getParticipantInfo = asyncHandler(
  async (req: Request, res: Response) => {
    const { userId, conversationId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      res.status(404);
      throw new Error("User not found");
    }
    const getUserInfo = await PrivateConversation.aggregate([
      {
        $match: { _id: new mongoose.Types.ObjectId(conversationId) },
      },
      {
        $unwind: "$participants",
      },
      {
        $match: {
          participants: { $ne: new mongoose.Types.ObjectId(userId) },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "participants",
          foreignField: "_id",
          as: "receiver_details",
        },
      },
      {
        $addFields: {
          check_user_read: {
            $size: "$userReadMessage",
          },
        },
      },
      {
        $addFields: {
          receiver_details: { $first: "$receiver_details" }, //Retrieve the chatmate's details from the array.
          is_user_already_seen_message: {
            $cond: {
              if: {
                $and: [
                  {
                    $eq: ["$check_user_read", 2], //To check if the check_user_read contains a receiver id who already read the message
                  },
                  {
                    $eq: [
                      "$lastMessage.sender",
                      new mongoose.Types.ObjectId(userId),
                    ],
                  },
                ],
              },
              then: true,
              else: false,
            },
          },
        },
      },
      {
        $project: {
          receiver_details: {
            name: "$receiver_details.name",
            _id: "$receiver_details._id",
            profilePic: "$receiver_details.profilePic",
            status: "$receiver_details.status",
            provider: "$receiver_details.provider",
            email: "$receiver_details.email",
          },
          is_user_already_seen_message: 1,
        },
      },
    ]);
    if (!getUserInfo) {
      res.status(404);
      throw new Error("User not found");
    }
    res.status(200).json({
      message: getUserInfo[0],
    });
  }
);

export const getParticipantName = asyncHandler(
  async (req: Request, res: Response) => {
    const { userId, conversationId } = req.params;
    if (conversationId === "new") {
      res.status(200).json({ message: null });
      return;
    }
    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      res.status(400);
      throw new Error("User Not Found");
    }
    const getChatMateName = await PrivateConversation.aggregate([
      {
        $match: { _id: new mongoose.Types.ObjectId(conversationId) },
      },
      {
        $unwind: "$participants",
      },
      {
        $match: {
          participants: { $ne: new mongoose.Types.ObjectId(userId) },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "participants",
          foreignField: "_id",
          as: "participant_name",
        },
      },
      {
        $project: {
          participant_name: {
            name: "$participant_name.name",
          },
        },
      },
    ]);
    if (getChatMateName.length === 0) {
      res.status(404);
      throw new Error("User Not Found");
    }
    res
      .status(200)
      .json({ name: getChatMateName[0].participant_name[0].name[0] }); //Retrieving the participant's name
  }
);
