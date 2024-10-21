import { Schema } from "mongoose";
export const referenceUser = {
  type: Schema.Types.ObjectId,
  ref: "User",
  required: true,
};
