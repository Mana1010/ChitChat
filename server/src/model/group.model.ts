import mongoose from "mongoose";
import { referenceModel } from "../utils/referenceModel";
const messageSchema = new mongoose.Schema(
  {
    groupId: referenceModel("Conversation"),
    sender: referenceModel("User"),
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    reaction: [
      {
        reactor: referenceModel("User"),
        reactionEmoji: String,
        reactionCreatedAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

type GroupSchema = mongoose.InferSchemaType<typeof messageSchema>;
export const Group =
  mongoose.models.Group || mongoose.model<GroupSchema>("Group", messageSchema);
messageSchema;
