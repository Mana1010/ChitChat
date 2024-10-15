import express from "express";
import {
  getAllPublicMessages,
  getAllUsers,
  getAllUsersConversation,
  chatUser,
  getParticipantInfo,
  getPrivateMessages,
  getChatNotifications,
  getParticipantName,
  searchUserResult,
  getPublicReactionList,
} from "../controllers/message.controller";
export const router = express.Router();

router.get("/messages/public", getAllPublicMessages);
router.get("/messages/chat-list/:id", getAllUsersConversation);
router.get("/messages/user-list", getAllUsers);
router.get(
  "/messages/participant-info/:userId/conversation/:conversationId",
  getParticipantInfo
);
router.get(
  "/messages/message-list/conversation/:conversationId",
  getPrivateMessages
);
router.post("/messages/newChat", chatUser);
router.get("/messages/notification/:senderId", getChatNotifications);
router.get("/messages/public/reaction-list/:messageId", getPublicReactionList);
router.get(
  "/messages/conversation-name/:userId/conversation/:conversationId",
  getParticipantName
);
router.get("/conversation/search-user", searchUserResult);
