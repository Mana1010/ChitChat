import mongoose, { Schema } from "mongoose";
import { referenceModel } from "../utils/referenceModel";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    profilePic: { type: String, required: true },
    bio: { type: String, default: "No bio" },
    authId: { type: String, required: true },
    provider: { type: String, required: true },
    status: { type: String, default: "Offline" },
    mail: {
      type: [
        {
          type: {
            type: String,
            enum: ["invitation", "message"],
            required: true,
          },
          from: referenceModel("User"),
          body: referenceModel("GroupConversation"),
          isAlreadyRead: { type: Boolean, default: false },
          status: {
            type: String,
            enum: ["pending", "accepted", "declined", "cancelled"],
            default: "pending",
          },
          sentAt: { type: Date, default: Date.now },
        },
      ],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

type UserSchema = mongoose.InferSchemaType<typeof userSchema>;
export const User =
  mongoose.models.User || mongoose.model<UserSchema>("User", userSchema);
