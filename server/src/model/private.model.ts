import mongoose, { Schema } from "mongoose";

// const chatSchema =
const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    sender: { type: Schema.Types.ObjectId, ref: "User" },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

type UserSchema = mongoose.InferSchemaType<typeof messageSchema>;
export const Private =
  mongoose.models.Private ||
  mongoose.model<UserSchema>("Private", messageSchema);
