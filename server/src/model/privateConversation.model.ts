import mongoose, { Schema } from "mongoose";
import { referenceModel } from "../utils/referenceModel";
const privateConversationSchema = new mongoose.Schema({
  participants: [referenceModel("User")],
  privateChatboardWallpaper: { type: String, required: true },
  userReadMessage: {
    type: [referenceModel("User")],
    default: [],
    validate: {
      validator: (arr: string[]) => {
        return arr.length <= 2; //Should be 2 user only
      },
      message: "Maximum of 2 users only",
    },
  },
  lastMessage: {
    sender: referenceModel("User"),
    text: { type: String, default: `💭 Conversation Started` },
    type: {
      type: String,
      enum: ["text", "file", "system"],
      default: "text",
    },
    lastMessageCreatedAt: { type: Date, default: Date.now },
  },
  createdAt: { type: Date, default: Date.now },
});

privateConversationSchema.index({ participants: 1 });
type PrivateConversationSchema = mongoose.InferSchemaType<
  typeof privateConversationSchema
>;
export const PrivateConversation =
  mongoose.models.Conversation ||
  mongoose.model<PrivateConversationSchema>(
    "PrivateConversation",
    privateConversationSchema
  );
