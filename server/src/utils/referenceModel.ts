import { Schema } from "mongoose";

export const referenceModel = (refModel: string, required = true) => {
  return { type: Schema.Types.ObjectId, ref: refModel, required };
};
