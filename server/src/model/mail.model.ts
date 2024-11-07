import mongoose, { mongo } from "mongoose";
import { referenceModel } from "../utils/referenceModel";
import { Schema } from "mongoose";
const mailSchema = new mongoose.Schema(
  {
    to: referenceModel("User"),
    isAlreadyRead: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["pending", "accepted", "declined", "cancelled"],
      default: "pending",
    },
    sentAt: { type: Date, default: Date.now },
  },
  { discriminatorKey: "kind" }
);
type MailSchema = mongoose.InferSchemaType<typeof mailSchema>;
export const Mail =
  mongoose.models.Mail || mongoose.model<MailSchema>("Mail", mailSchema);

export const Invitation = Mail.discriminator<any>(
  "invitation",
  new mongoose.Schema({
    from: referenceModel("User"),
    body: referenceModel("GroupConversation"),
  })
);

export const Message = Mail.discriminator(
  "message",
  new mongoose.Schema({
    from: { type: String, default: "ChitChat Developer" },
  })
);
