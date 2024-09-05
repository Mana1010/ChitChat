export interface User {
  name: string;
  profilePic: string;
  _id: string;
  status: string;
}

export interface Conversation {
  receiver: User;
  userId: string;
  _id: string;
  lastMessage: string;
}
