import express from "express";
import {
  acceptInvitation,
  declineInvitation,
} from "../controllers/shared.controller";
export const router = express.Router();

router.patch("/accept/invitation/:groupId/:userId", acceptInvitation);
router.patch("/decline/invitation/:groupId/:userId", declineInvitation);
