import express from "express";
import {
  getAllPublicMessages,
  getAllUsers,
  getAllUsersConversation,
  chatUser,
} from "../controllers/message.controller";
export const router = express.Router();

router.get("/messages/public", getAllPublicMessages);
router.get("/messages/chat-list/:id", getAllUsersConversation);
router.get("/messages/user-list", getAllUsers);
router.post("/messages/newChat", chatUser);
