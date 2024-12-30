export interface GroupChatDetails {
  _id: string;
  groupName: string;
  groupPhoto: {
    publicId: string;
    photoUrl: string;
  };
  lastMessage: {
    sender: { name: string; _id: string };
    type: string;
    text: string;
    lastMessageCreatedAt: Date;
  };
}

export interface IdsSchema {
  groupId: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
}
