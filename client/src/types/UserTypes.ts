export interface User {
  name: string;
  profilePic: string;
  _id: string;
  status: string;
  userId: string;
}

export interface Conversation {
  receiver_details: User;
  _id: string;
  hasUnreadMessages: {
    user: User | string;
    totalUnreadMessages: number;
  };
  lastMessage: {
    sender: User | string;
    text: string;
    lastMessageCreatedAt: Date;
  };
  updatedAt: string;
}

export interface Messages {
  _id?: string;
  sender: User;
  message: string;
  isRead: boolean;
  reaction: string;
}
export interface PublicMessages {
  _id: string;
  userId: User | any;
  message: string;
  createdAt: string | any;
  isMessageDeleted: boolean;
}
export interface GetParticipantInfo {
  _id: string;
  receiver_details: User;
  hasUnreadMessages: {
    user: User | string;
    totalUnreadMessages: number;
  };
}
