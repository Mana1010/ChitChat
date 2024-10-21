import mongoose, { Schema } from "mongoose";
import { referenceUser } from "../utils/referenceUser";

const groupSchema = new mongoose.Schema({
  admin: referenceUser,

  members: [referenceUser],

  hasUnreadMessages: [
    {
      user: referenceUser, //This field is for the user who have not unread the message.
      totalUnreadMessages: { type: Schema.Types.Number, default: 0 },
    },
  ],

  lastMessage: {
    sender: referenceUser,
    text: { type: String, default: "👋" },
    messageType: {
      type: String,
      enum: ["text", "file"],
      default: "text",
    },

    lastMessageCreatedAt: { type: Date, default: () => new Date() },
  },

  createdAt: { type: Date, default: Date.now() },
});

type GroupConversationSchema = mongoose.InferSchemaType<typeof groupSchema>;
export const GroupConversation =
  mongoose.models.GroupConversation ||
  mongoose.model<GroupConversationSchema>("GroupConversation", groupSchema);
