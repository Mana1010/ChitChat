import mongoose, { Schema } from "mongoose";

// const userInfo = new Schema({
//   id:
// })
const messageSchema = new mongoose.Schema(
  {
    userInfo: {},
    message: { type: String },
    isMessageDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

type MessageSchema = mongoose.InferSchemaType<typeof messageSchema>;
export const Public =
  mongoose.models.Public ||
  mongoose.model<MessageSchema>("Public", messageSchema);
