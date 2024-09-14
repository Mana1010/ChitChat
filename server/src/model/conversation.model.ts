import mongoose, { Schema } from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    participants: [{ type: Schema.Types.ObjectId, ref: "User" }],
    lastMessage: { type: String, default: "👋" },
  },
  {
    timestamps: true,
  }
);

type ConversationSchema = mongoose.InferSchemaType<typeof conversationSchema>;
export const Conversation =
  mongoose.models.Conversation ||
  mongoose.model<ConversationSchema>("Conversation", conversationSchema);
