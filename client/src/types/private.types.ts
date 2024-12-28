import { User } from "./shared.types";

export interface Conversation {
  receiver_details: User;
  _id: string;
  is_user_already_seen_message: boolean;
  // userReadMessage: string[];
  already_read_message: boolean;
  lastMessage: {
    sender: Pick<User, "_id">;
    text: string;
    type: "text" | "system" | "file";
    lastMessageCreatedAt: Date;
  };
  updatedAt: string;
}
