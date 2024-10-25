import express from "express";
import {
  getSidebarNotificationAndCurrentConversation,
  searchUserResult,
} from "../controllers/app.controller";

export const router = express.Router();

router.get("/sidebar/:senderId", getSidebarNotificationAndCurrentConversation);
router.get("/search/user", searchUserResult);
