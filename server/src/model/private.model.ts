import mongoose, { Schema } from "mongoose";

// const chatSchema =
const messageSchema = new mongoose.Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    message: [],
  },
  {
    timestamps: true,
  }
);

type UserSchema = mongoose.InferSchemaType<typeof messageSchema>;
export const Private =
  mongoose.models.Private ||
  mongoose.model<UserSchema>("Private", messageSchema);
