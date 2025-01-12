import mongoose, { Schema } from "mongoose";
import { referenceModel } from "../utils/referenceModel";
import { string } from "zod";

const groupSchema = new mongoose.Schema({
  creator: referenceModel("User"),
  groupName: { type: String, required: true },
  groupPhoto: { type: String, required: true },
  groupChatboardWallpaper: {
    type: String,
    required: true,
  },
  members: [
    {
      memberInfo: referenceModel("User"),
      role: { type: String, enum: ["admin", "guest"], default: "guest" },
      joinedAt: { type: Date, default: Date.now },
      status: {
        type: String,
        enum: ["active", "pending", "requesting"],
        default: "pending",
      },
    },
  ],

  memberReadMessage: {
    type: [referenceModel("User")],
    default: [],
  },

  lastMessage: {
    sender: referenceModel("User"),
    text: { type: String, default: "created this group" },
    type: {
      type: String,
      enum: ["text", "file", "system"],
      default: "text",
    },
    lastMessageCreatedAt: { type: Date, default: Date.now },
  },
  createdAt: { type: Date, default: Date.now },
});

groupSchema.index({ "members.memberInfo": 1 });

type GroupConversationSchema = mongoose.InferSchemaType<typeof groupSchema>;
export const GroupConversation =
  mongoose.models.GroupConversation ||
  mongoose.model<GroupConversationSchema>("GroupConversation", groupSchema);
