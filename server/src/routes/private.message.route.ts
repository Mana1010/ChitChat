import express from "express";
import {
  getAllUsers,
  getAllUsersConversation,
  chatUser,
  getParticipantInfo,
  getPrivateMessages,
  getUserChatStatus,
  getParticipantName,
  searchUserResult,
} from "../controllers/message.controller";
export const router = express.Router();

router.get("/all/chat/list/:id", getAllUsersConversation);
router.get("/all/user/list", getAllUsers);
router.get("/participant/info/:userId/:conversationId", getParticipantInfo);
router.get("/message/list/:conversationId", getPrivateMessages);
router.post("/new/chat", chatUser);
router.get("/user/chat/status/:senderId", getUserChatStatus);
router.get(
  "/participant/name/:userId/conversation/:conversationId",
  getParticipantName
);
router.get("/conversation/search/user", searchUserResult);
