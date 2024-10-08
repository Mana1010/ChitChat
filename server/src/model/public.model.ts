import mongoose, { Schema } from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    sender: { type: Schema.Types.ObjectId, ref: "User" },
    message: { type: String },
    isMessageDeleted: { type: Boolean, default: false },
    reactions: [
      {
        reactor: {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
        reaction: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

type MessageSchema = mongoose.InferSchemaType<typeof messageSchema>;
export const Public =
  mongoose.models.Public ||
  mongoose.model<MessageSchema>("Public", messageSchema);
