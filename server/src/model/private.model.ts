import mongoose, { Schema } from "mongoose";
import { referenceModel } from "../utils/referenceModel";
const messageSchema = new mongoose.Schema(
  {
    conversationId: referenceModel("Conversation"),
    sender: referenceModel("User"),
    message: { type: String, required: true },
    type: { type: String, enum: ["text", "file"], default: "text" },
    isRead: { type: Boolean, default: false },
    reaction: { type: String, default: "" },
  },
  {
    timestamps: true,
  }
);

type UserSchema = mongoose.InferSchemaType<typeof messageSchema>;
export const Private =
  mongoose.models.Private ||
  mongoose.model<UserSchema>("Private", messageSchema);
