import { Public } from "../../../server/src/model/public.model";
import { UserSchema } from "../../../server/src/model/user.model";
import { connectDb } from "../db";
export const getAllPublicMessages = async () => {
  try {
    await connectDb();
    const getAllMessages = await Public.find()
      .populate<{ userId: UserSchema }>({
        path: "userId",
        select: ["-createdAt", "-updatedAt", "-__v"],
      })
      .select(["message", "isMessageDeleted"])
      .lean();
    return JSON.parse(JSON.stringify(getAllMessages)); //To fix the issue about recursion and convert it to plain object
  } catch (err) {
    return null;
  }
};
