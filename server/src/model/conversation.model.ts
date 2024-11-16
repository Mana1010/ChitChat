import mongoose, { Schema } from "mongoose";
import { referenceModel } from "../utils/referenceModel";
const conversationSchema = new mongoose.Schema({
  participants: [referenceModel("User")],
  hasUnreadMessages: {
    user: referenceModel("User", false), //This field is for the user who have not unread the message.
    totalUnreadMessages: { type: Schema.Types.Number, default: 0 },
  },
  lastMessage: {
    sender: referenceModel("User", false),
    text: { type: String, default: `Wave "👋" to them` },
    type: {
      type: String,
      enum: ["text", "file", "system"],
      default: "text",
    },
    lastMessageCreatedAt: { type: Date, default: Date.now },
  },
  createdAt: { type: Date, default: Date.now },
});

type ConversationSchema = mongoose.InferSchemaType<typeof conversationSchema>;
export const Conversation =
  mongoose.models.Conversation ||
  mongoose.model<ConversationSchema>("Conversation", conversationSchema);
