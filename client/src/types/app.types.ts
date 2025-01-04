import { User } from "./shared.types";

export interface MailListSchema {
  _id: string;
  isAlreadyRead: boolean;
  kind: "invitation" | "request" | "message";
  sentAt: string;
}
export interface MailDetailsSchema {
  sentAt: string;
  to: string;
  status: "pending" | "accepted" | "declined" | "cancelled" | "none";
  group_details: {
    groupName: string;
    groupPhoto: string;
    _id: string;
    total_members: number;
  };
  kind: "invitation" | "request" | "message";
  sender_details: Pick<User, "name" | "profilePic" | "_id">;
  _id: string;
}

export interface SidebarSchema {
  userChatStatusObj: {
    privateConversationStatus: string | null;
    groupConversationStatus: string | null;
  };
  userNotificationObj: {
    totalUnreadPrivateConversation: string[];
    totalUnreadGroupConversation: string[];
    totalUnreadMail: string[];
  };
}
