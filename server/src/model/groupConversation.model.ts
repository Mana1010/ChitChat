import mongoose, { Schema } from "mongoose";
import { referenceModel } from "../utils/referenceModel";

const groupSchema = new mongoose.Schema({
  creator: referenceModel("User"),
  groupName: { type: String, required: true },
  groupPhoto: {
    publicId: { type: String, required: true },
    photoUrl: { type: String, required: true },
  },
  members: [
    {
      memberInfo: referenceModel("User"),
      role: { type: String, default: "guest" },
      joinedAt: { type: Date, default: () => new Date() },
      status: { type: String, enum: ["active", "pending"], default: "pending" },
    },
  ],

  hasUnreadMessages: {
    type: [
      {
        user: referenceModel("User"), //This field is for the user who have not unread the message.
        totalUnreadMessages: { type: Schema.Types.Number, default: 0 },
      },
    ],
    default: [],
  },

  lastMessage: {
    sender: referenceModel("User", false),
    text: { type: String, default: "👋" },
    messageType: {
      type: String,
      enum: ["text", "file"],
      default: "text",
    },
    lastMessageCreatedAt: { type: Date, default: () => new Date() },
  },
  createdAt: { type: Date, default: Date.now },
});

type GroupConversationSchema = mongoose.InferSchemaType<typeof groupSchema>;
export const GroupConversation =
  mongoose.models.GroupConversation ||
  mongoose.model<GroupConversationSchema>("GroupConversation", groupSchema);
