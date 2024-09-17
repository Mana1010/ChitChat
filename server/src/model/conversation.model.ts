import mongoose, { Schema } from "mongoose";

const conversationSchema = new mongoose.Schema({
  participants: [{ type: Schema.Types.ObjectId, ref: "User" }],
  hasUnreadMessages: { type: Boolean, default: false },
  lastMessage: {
    sender: { type: Schema.Types.ObjectId, ref: "User" },
    text: { type: String, default: "👋" },
    lastMessageCreatedAt: { type: Date, default: () => new Date() },
  },
  createdAt: { type: Date, default: new Date() },
});

type ConversationSchema = mongoose.InferSchemaType<typeof conversationSchema>;
export const Conversation =
  mongoose.models.Conversation ||
  mongoose.model<ConversationSchema>("Conversation", conversationSchema);
