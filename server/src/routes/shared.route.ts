import express from "express";
import {
  acceptInvitation,
  acceptRequest,
  declineInvitation,
  declineRequest,
} from "../controllers/shared.controller";
export const router = express.Router();

router.patch("/accept/invitation/:groupId/:userId", acceptInvitation);
router.patch("/decline/invitation/:groupId/:userId", declineInvitation);
router.patch("/accept/request/:requesterId/:groupId/:userId", acceptRequest);
router.patch("/decline/request/:requesterId/:groupId/:userId", declineRequest);
