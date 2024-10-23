import express from "express";
import {
  getUserGroupChatStatus,
  getAllGroups,
  searchGroupResult,
} from "../controllers/group.message.controller";

export const router = express.Router();

router.get("/user/group/status/:senderId", getUserGroupChatStatus);
router.get("/all/group/list", getAllGroups);
router.get("/conversation/search/group", searchGroupResult);
