import express from "express";
import {
  getSidebarNotificationAndCurrentConversation,
  searchUserResult,
  getAllMail,
  updateMailStatus,
  getMailDetails,
  deleteMultipleMail,
  deleteSingleMail,
} from "../controllers/app.controller";

export const router = express.Router();

router.get("/sidebar/:senderId", getSidebarNotificationAndCurrentConversation);
router.get("/search/user", searchUserResult);
router.get("/mail/list/:userId", getAllMail);
router.get("/mail/details/:userId/:mailId", getMailDetails);
router.patch("/update/mail/status/:mailId", updateMailStatus);
router.delete("/delete/multiple/mail/:mailId", deleteMultipleMail);
router.delete("/delete/single/mail/:mailId", deleteSingleMail);
