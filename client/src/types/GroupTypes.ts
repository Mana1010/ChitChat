import { User } from "./UserTypes";
interface BaseGroupChatSchema<AdminUserType = string, MemberUserType = string> {
  _id: string;
  creator: AdminUserType;
  members: { memberInfo: MemberUserType; role: string; joinedAt: string }[];
  groupName: string;
  groupPhoto: {
    groupId: string;
    photoUrl: string;
  };
  createdAt: string;
}
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
