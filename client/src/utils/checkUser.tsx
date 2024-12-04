"use server";
import { AUTH_SERVER_URL } from "./serverUrl";
import { User } from "@/types/shared.types";
interface ExtendUser extends User {
  provider: "google";
}
interface UserSchema {
  user_data: ExtendUser;
  status: "exist" | "not-exist";
}
export async function checkUser(
  authId: string | undefined
): Promise<UserSchema> {
  const response = await fetch(`${AUTH_SERVER_URL}/check/user/${authId}`, {
    next: {
      revalidate: 60 * 60 * 24 * 3, //revalidate for 3 days
    },
  });
  const data = await response.json();
  const user_data = data.message;
  const status = data.status;

  return { user_data, status };
}
