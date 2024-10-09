import mongoose, { Schema } from "mongoose";

const conversationSchema = new mongoose.Schema({
  participants: [{ type: Schema.Types.ObjectId, ref: "User" }],
  hasUnreadMessages: {
    user: { type: Schema.Types.ObjectId, ref: "User" }, //This field is for the user who have not unread the message.
    totalUnreadMessages: { type: Schema.Types.Number, default: 0 },
  },
  lastMessage: {
    sender: { type: Schema.Types.ObjectId, ref: "User" },
    text: { type: String, default: "👋" },
    messageType: {
      type: String,
      enum: ["text", "file"],
      default: "text",
    },
    lastMessageCreatedAt: { type: Date, default: () => new Date() },
  },
  createdAt: { type: Date, default: new Date() },
});

type ConversationSchema = mongoose.InferSchemaType<typeof conversationSchema>;
export const Conversation =
  mongoose.models.Conversation ||
  mongoose.model<ConversationSchema>("Conversation", conversationSchema);
