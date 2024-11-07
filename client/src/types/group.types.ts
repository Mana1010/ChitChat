import { User } from "./shared.types";
import { BaseGroupChatSchema } from "./shared.types";
export interface GroupChatList
  extends Pick<BaseGroupChatSchema, "_id" | "groupName" | "groupPhoto"> {
  totalMember: number;
}

export interface GroupChatConversationList<SenderType = string>
  extends Pick<BaseGroupChatSchema, "_id" | "groupName" | "groupPhoto"> {
  lastMessage: {
    sender: SenderType;
    text: string;
    messageType: string;
    lastMessageCreatedAt: string;
  };
}

export interface GroupChatHeaderInfo
  extends Pick<BaseGroupChatSchema, "_id" | "groupName" | "groupPhoto"> {
  total_member: number;
}
