import mongoose, { Schema } from "mongoose";
import { referenceModel } from "../utils/referenceModel";
const messageSchema = new mongoose.Schema(
  {
    conversationId: referenceModel("Conversation"),
    sender: referenceModel("User"),
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ["text", "file", "system", "time"],
      default: "text",
    },
    reactions: { type: String, default: "" },
  },
  {
    timestamps: true,
  }
);

messageSchema.index({ conversationId: 1, sender: 1 });

type UserSchema = mongoose.InferSchemaType<typeof messageSchema>;
export const Private =
  mongoose.models.Private ||
  mongoose.model<UserSchema>("Private", messageSchema);
