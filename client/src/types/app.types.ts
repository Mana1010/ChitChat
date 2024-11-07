export interface MailListSchema {
  _id: string;
  type: string;
  isAlreadyRead: boolean;
  status: string;
  sentAt: string;
}
export interface MailDetailsSchema {
  senAt: string;
  group_details: {
    groupName: string;
    groupPhoto: {
      publicId: string;
      photoUrl: string;
    };
    _id: string;
    total_members: number;
  };
  totalMember: number;
  kind: string;
  from: string;
  _id: string;
}

export interface SidebarSchema {
  userChatStatusObj: {
    privateConversationStatus: string | null;
    groupConversationStatus: string | null;
  };
  userNotificationObj: {
    privateNotificationCount: number;
    groupNotificationCount: number;
    mailboxNotificationCount: number;
  };
}
