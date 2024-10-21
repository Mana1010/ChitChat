import mongoose, { Schema } from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    groupId: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    reaction: [
      {
        reactor: { type: Schema.Types.ObjectId, ref: "User", required: true },
        reactionEmoji: String,
        reactionCreatedAt: { type: Date, default: () => new Date() },
      },
    ],
  },
  {
    timestamps: true,
  }
);

type GroupSchema = mongoose.InferSchemaType<typeof messageSchema>;
export const Group =
  mongoose.models.Group || mongoose.model<GroupSchema>("Group", messageSchema);
messageSchema;
