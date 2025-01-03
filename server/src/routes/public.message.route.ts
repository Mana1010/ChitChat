import express from "express";
import {
  getAllPublicMessages,
  getPublicReactionList,
} from "../controllers/public.message.controller";
export const router = express.Router();

router.get("/all/messages", getAllPublicMessages);
router.get("/message/reaction/list/:messageId", getPublicReactionList);
