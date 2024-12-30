import express from "express";
import {
  getUserGroupChatStatus,
  getAllGroups,
  searchGroupResult,
  getAllGroupChatConversation,
  createGroupChat,
  getGroupChatInfo,
  getGroupMessages,
  joinGroup,
  groupChatDetails,
} from "../controllers/group.message.controller";

export const router = express.Router();

router.get("/user/group/status/:senderId", getUserGroupChatStatus);
router.get("/explore/all/group/list/:userId", getAllGroups);
router.get("/group/chat/details/:groupId", groupChatDetails);
router.get("/all/groupchat/list/:id", getAllGroupChatConversation);
router.get("/conversation/search/group", searchGroupResult);
router.post("/create/groupchat", createGroupChat);
router.get("/group/info/:groupId/:userId", getGroupChatInfo);
router.get("/message/list/:groupId", getGroupMessages);
router.patch("/join/group/:groupId/:userId", joinGroup);
