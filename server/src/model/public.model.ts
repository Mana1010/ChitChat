import mongoose, { Schema } from "mongoose";
import { referenceModel } from "../utils/referenceModel";

const messageSchema = new mongoose.Schema(
  {
    sender: referenceModel("User"),
    message: { type: String },
    isMessageDeleted: { type: Boolean, default: false },
    reactions: [
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

type MessageSchema = mongoose.InferSchemaType<typeof messageSchema>;
export const Public =
  mongoose.models.Public ||
  mongoose.model<MessageSchema>("Public", messageSchema);
