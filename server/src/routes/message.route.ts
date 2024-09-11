import express from "express";
import {
  getAllPublicMessages,
  getAllUsers,
  getAllUsersConversation,
  chatUser,
  getReceiverInfo,
  getChatNotifications,
} from "../controllers/message.controller";
export const router = express.Router();

router.get("/messages/public", getAllPublicMessages);
router.get("/messages/chat-list/:id", getAllUsersConversation);
router.get("/messages/user-list", getAllUsers);
router.get(
  "/messages/receiver-info/:userId/conversation/:conversationId",
  getReceiverInfo
);
router.post("/messages/newChat", chatUser);
router.get("/messages/notification/:senderId", getChatNotifications);
