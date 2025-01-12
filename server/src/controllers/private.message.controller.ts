import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import { User } from "../model/user.model";
import { Private } from "../model/private.model";
import { PrivateConversation } from "../model/privateConversation.model";
import mongoose from "mongoose";
import { appLogger } from "../utils/loggers.utils";

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
            as: "participant_details",
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
            participant_details: { $first: "$participant_details" },
            _id: 1,
            lastMessage: {
              sender: {
                _id: "$lastMessage.sender",
              },
              text: 1,
              type: 1,
              lastMessageCreatedAt: 1,
            },
            updatedAt: 1,
            already_read_message: 1,
          },
        },
      ]);
      res.status(200).json({ message: getAllConversation });
    } catch (err) {
      appLogger.error(err);
    }
  }
);

export const getPrivateMessages = asyncHandler(
  async (req: Request, res: Response) => {
    const { conversationId, userId } = req.params;
    const { page, limit } = req.query;
    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      res.status(404);
      throw new Error("Conversation does not exist");
    }

    const checkIfUserIsPartOfConversation = await PrivateConversation.exists({
      _id: conversationId,
      participants: { $in: [userId] },
    });

    if (!checkIfUserIsPartOfConversation) {
      res.status(403);
      throw new Error("You are forbidden to access this private conversation");
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
      .select(["sender", "message", "createdAt", "reactions", "type"]);

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
          privateChatboardWallpaper: 1,
          receiver_details: {
            name: 1,
            _id: 1,
            profilePic: 1,
            status: {
              type: 1,
              lastActiveAt: 1,
            },
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
      throw new Error("Invalid Id");
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
