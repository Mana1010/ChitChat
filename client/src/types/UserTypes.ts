import { User } from "./shared.types";
import { Reaction } from "./shared.types";
export interface FullInfoUser extends User {
  provider: string;
  email: string;
  bio: string;
}

export interface PublicMessages<UserType = string> {
  _id: string;
  sender: UserType;
  message: string;
  createdAt: string;
  isMessageDeleted: boolean;
  reactions: Reaction[];
}
export interface GetParticipantInfo {
  _id: string;
  receiver_details: User;
  is_user_already_seen_message: boolean;
}
