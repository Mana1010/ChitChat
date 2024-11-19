import mongoose, { Schema } from "mongoose";
import { referenceModel } from "../utils/referenceModel";
const privateConversationSchema = new mongoose.Schema({
  participants: [referenceModel("User")],
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

type PrivateConversationSchema = mongoose.InferSchemaType<
  typeof privateConversationSchema
>;
export const PrivateConversation =
  mongoose.models.Conversation ||
  mongoose.model<PrivateConversationSchema>(
    "PrivateConversation",
    privateConversationSchema
  );
