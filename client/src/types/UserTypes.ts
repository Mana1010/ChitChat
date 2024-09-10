export interface User {
  name: string;
  profilePic: string;
  _id: string;
  status: string;
}

export interface Conversation {
  receiver_details: User;
  _id: string;
  lastMessage?: string;
}

export interface Messages {
  _id?: string;
  sender: User;
  message: string;
  isRead: boolean;
}
