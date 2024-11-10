import mongoose from "mongoose";
import { referenceModel } from "../utils/referenceModel";
const messageSchema = new mongoose.Schema(
  {
    groupId: referenceModel("GroupConversation"),
    sender: referenceModel("User"),
    message: { type: String, required: true },
    type: { type: String, enum: ["text", "file", "system"], default: "text" },
    reactions: {
      type: [
        {
          reactor: referenceModel("User"),
          reactionEmoji: String,
          reactionCreatedAt: { type: Date, default: Date.now },
        },
      ],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

type GroupSchema = mongoose.InferSchemaType<typeof messageSchema>;
export const Group =
  mongoose.models.Group || mongoose.model<GroupSchema>("Group", messageSchema);
messageSchema;
