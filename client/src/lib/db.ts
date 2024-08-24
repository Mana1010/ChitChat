import mongoose from "mongoose";

export async function connectDb() {
  try {
    await mongoose.connect(process.env.MONGO_URI!);
  } catch (err) {
    process.exit(0);
  }
}
