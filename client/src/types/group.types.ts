import { User } from "./shared.types";
import { BaseGroupChatSchema } from "./shared.types";
export interface GroupChatList
  extends Pick<BaseGroupChatSchema, "_id" | "groupName" | "groupPhoto"> {
  totalMember: number;
  is_group_active: boolean;
  this_group_inviting_you: boolean;
  user_group_status: "pending" | "requesting" | "no-status";
}

export interface GroupChatConversationList<SenderType = string>
  extends Pick<BaseGroupChatSchema, "_id" | "groupName" | "groupPhoto"> {
  is_group_active: boolean;
  lastMessage: {
    sender: SenderType;
    text: string;
    type: "text" | "system" | "file";
    lastMessageCreatedAt: Date;
  };
}

export interface GroupChatInfo
  extends Pick<BaseGroupChatSchema, "_id" | "groupName" | "groupPhoto"> {
  is_group_active: boolean;
  total_member: number;
}
