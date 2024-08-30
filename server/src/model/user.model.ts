import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String },
    profilePic: { type: String },
    authId: { type: String },
    provider: { type: String },
    status: { type: String, default: "Online" },
  },
  {
    timestamps: true,
  }
);

type UserSchema = mongoose.InferSchemaType<typeof userSchema>;
export const User =
  mongoose.models.User || mongoose.model<UserSchema>("User", userSchema);
