import express from "express";
import {
  getUserGroupChatStatus,
  getAllGroups,
  searchGroupResult,
  getAllGroupChatConversation,
} from "../controllers/group.message.controller";

export const router = express.Router();

router.get("/user/group/status/:senderId", getUserGroupChatStatus);
router.get("/explore/all/group/list", getAllGroups);
router.get("/all/groupchat/list/:id", getAllGroupChatConversation);
router.get("/conversation/search/group", searchGroupResult);
