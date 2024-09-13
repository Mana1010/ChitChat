export interface User {
  name: string;
  profilePic: string;
  _id: string;
  status: string;
}

export interface Conversation {
  receiver_details: User;
  _id: string;
  lastMessage: string;
  updatedAt: string;
}

export interface Messages {
  _id?: string;
  sender: User;
  message: string;
  isRead: boolean;
}

export type ConversationAndMessagesSchema = {
  getUserInfo: {
    _id: string;
    receiver_details: User;
  };
  getMessages: Messages[];
};
