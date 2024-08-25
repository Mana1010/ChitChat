import mongoose, { Schema } from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    message: { type: String },
    isMessageDeleted: { type: Boolean },
  },
  {
    timestamps: true,
  }
);

type MessageSchema = mongoose.InferSchemaType<typeof messageSchema>;
export const Public =
  mongoose.models.Public ||
  mongoose.model<MessageSchema>("Public", messageSchema);
