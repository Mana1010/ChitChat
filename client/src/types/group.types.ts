import { User } from "./shared.types";
import { BaseGroupChatSchema } from "./shared.types";
export interface GroupChatList
  extends Pick<BaseGroupChatSchema, "_id" | "groupName" | "groupPhoto"> {
  totalMember: number;
  this_group_inviting_you: boolean;
}

export interface GroupChatConversationList<SenderType = string>
  extends Pick<BaseGroupChatSchema, "_id" | "groupName" | "groupPhoto"> {
  lastMessage: {
    sender: SenderType;
    text: string;
    type: "text" | "system" | "file";
    lastMessageCreatedAt: string;
  };
}

export interface GroupChatHeaderInfo
  extends Pick<BaseGroupChatSchema, "_id" | "groupName" | "groupPhoto"> {
  total_member: number;
}
