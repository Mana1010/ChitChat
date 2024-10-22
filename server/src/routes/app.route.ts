import express from "express";
import { getSidebarNotificationAndCurrentConversation } from "../controllers/app.controller";

export const router = express.Router();

router.get("/sidebar/:senderId", getSidebarNotificationAndCurrentConversation);
