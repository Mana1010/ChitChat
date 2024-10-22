import mongoose, { Schema } from "mongoose";
import { referenceModel } from "../utils/referenceModel";
const conversationSchema = new mongoose.Schema({
  participants: [referenceModel("User")],
  hasUnreadMessages: {
    user: referenceModel("User"), //This field is for the user who have not unread the message.
    totalUnreadMessages: { type: Schema.Types.Number, default: 0 },
  },
  lastMessage: {
    sender: referenceModel("User"),
    text: { type: String, default: `Wave "👋" to them` },
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
