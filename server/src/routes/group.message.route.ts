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
  getGroupMembers,
} from "../controllers/group.message.controller";

export const router = express.Router();
router.get("/user/group/status/:senderId", getUserGroupChatStatus);
router.get("/explore/all/group/list/:userId", getAllGroups);
router.get("/all/groupchat/list/:id", getAllGroupChatConversation);
router.get("/conversation/search/group", searchGroupResult);
router.get("/group/info/:groupId/:userId", getGroupChatInfo);
router.get("/message/list/:groupId", getGroupMessages);
router.get("/group/chat/full/details/:groupId/:userId", groupChatDetails);
router.get("/all/group/members/:groupId/:userId", getGroupMembers);

router.post("/create/groupchat", createGroupChat);

router.patch("/join/group/:groupId/:userId", joinGroup);
