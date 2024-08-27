import express from "express";
import { getAllPublicMessages } from "../controllers/message.controller";
export const router = express.Router();

router.get("/messages", getAllPublicMessages);
