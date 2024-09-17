export interface User {
  name: string;
  profilePic: string;
  _id: string;
  status: string;
}

export interface Conversation {
  receiver_details: User;
  _id: string;
  hasUnreadMessages: boolean;
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
}
export interface PublicMessages {
  _id: string;
  userId: User | any;
  message: string;
  createdAt: string;
  isMessageDeleted: boolean;
}
export type ConversationAndMessagesSchema = {
  getUserInfo: {
    _id: string;
    receiver_details: User;
  };
  getMessages: Messages[];
};
