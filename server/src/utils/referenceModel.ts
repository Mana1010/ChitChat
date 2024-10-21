import { Schema } from "mongoose";

export const referenceModel = (refModel: string) => {
  return { type: Schema.Types.ObjectId, ref: refModel, required: true };
};
