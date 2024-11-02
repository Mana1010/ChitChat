import mongoose, { mongo } from "mongoose";
import { referenceModel } from "../utils/referenceModel";

const mailSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["invitation", "message"],
      required: true,
    },
    from: referenceModel("User"),
    to: referenceModel("User"),
    isAlreadyRead: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["pending", "accepted", "declined", "cancelled"],
      default: "pending",
    },
    sentAt: { type: Date, default: () => new Date() },
  },
  { discriminatorKey: "kind" }
);
type MailSchema = mongoose.InferSchemaType<typeof mailSchema>;
const Mail =
  mongoose.models.Mail || mongoose.model<MailSchema>("Mail", mailSchema);

export const Invitation = Mail.discriminator(
  "invitation",
  new mongoose.Schema({
    body: { type: mongoose.Types.ObjectId, ref: "GroupConversation" },
  })
);

export const Message = Mail.discriminator("message", new mongoose.Schema({}));
