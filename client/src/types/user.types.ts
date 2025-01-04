import { User } from "./shared.types";
export interface GetParticipantInfo {
  _id: string;
  receiver_details: User;
  is_user_already_seen_message: boolean;
  privateChatboardWallpaper: string;
}
