import mongoose, { Schema } from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    profilePic: { type: String, required: true },
    bio: { type: String, default: "No bio" },
    authId: { type: String, required: true },
    provider: { type: String, required: true },
    status: { type: String, default: "Offline" },
    notification: [
      {
        from: { type: Schema.Types.ObjectId, ref: "User", required: true },
        body: String,
        notificationCreatedAt: { type: Date, default: () => new Date() },
      },
    ],
  },
  {
    timestamps: true,
  }
);

type UserSchema = mongoose.InferSchemaType<typeof userSchema>;
export const User =
  mongoose.models.User || mongoose.model<UserSchema>("User", userSchema);
