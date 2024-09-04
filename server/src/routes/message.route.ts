import express from "express";
import {
  getAllPublicMessages,
  getAllUsers,
  getAllUsersConversation,
} from "../controllers/message.controller";
export const router = express.Router();

router.get("/messages/public", getAllPublicMessages);
router.get("/messages/chat-list/:id", getAllUsersConversation);
router.get("/messages/user-list", getAllUsers);
