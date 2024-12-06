import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    profilePic: { type: String, required: true },
    bio: { type: String, default: "No bio" },
    authId: { type: String, required: true },
    provider: { type: String, required: true },
    status: {
      type: {
        type: String,
        enum: ["offline", "online", "busy"],
        default: "online",
      },
      lastActiveAt: { type: Date, default: Date.now },
    },
  },
  {
    timestamps: true,
  }
);

type UserSchema = mongoose.InferSchemaType<typeof userSchema>;
export const User =
  mongoose.models.User || mongoose.model<UserSchema>("User", userSchema);
