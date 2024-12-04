import express from "express";
import { createUser, checkUser } from "../controllers/auth.controller";
export const router = express.Router();

router.get("/check/user/:id", checkUser);
router.post("/create/user", createUser);
