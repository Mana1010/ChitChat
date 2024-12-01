import { Session } from "next-auth";
export function userData(session: Session | null) {
  const userData = {
    name: session?.user.name.split(" ")[0],
    profilePic: session?.user.image,
    status: {
      type: "online" as "online",
      lastActiveAt: new Date(),
    },
    _id: session?.user.userId,
  };
  return userData;
}
