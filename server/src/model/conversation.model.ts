import mongoose, { mongo, Schema } from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    participants: [{ type: Schema.Types.ObjectId, ref: "User" }],
    lastMessage: { type: Schema.Types.ObjectId, ref: "Private" },
  },
  {
    timestamps: true,
  }
);

type ConversationSchema = mongoose.InferSchemaType<typeof conversationSchema>;
export const Conversation =
  mongoose.models.Conversation ||
  mongoose.model<ConversationSchema>("Conversation", conversationSchema);
