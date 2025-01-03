import express from "express";

import {
  getAllUsers,
  getAllUsersConversation,
  getParticipantInfo,
  getPrivateMessages,
  getParticipantName,
} from "../controllers/private.message.controller";
export const router = express.Router();

router.get("/all/chat/list/:id", getAllUsersConversation);
router.get("/all/user/:userId/list", getAllUsers);
router.get("/participant/info/:userId/:conversationId", getParticipantInfo);
router.get("/message/list/:conversationId", getPrivateMessages);

router.get(
  "/participant/name/:userId/conversation/:conversationId",
  getParticipantName
);
