export interface User {
  name: string;
  profilePic: string;
  _id: string;
  status: string;
  userId?: string;
}
export interface Reaction<ReactionType = string> {
  reactor: ReactionType;
  reactionEmoji: string;
  reactionCreatedAt: string;
}

export interface Message<UserType = string, ReactionType = string> {
  _id: string;
  sender: UserType;
  message: string;
  type: string;
  reactions: ReactionType;
  createdAt: string;
}

export interface InfiniteScrollingMessageSchema {
  pages: [{ getMessages: Message[]; nextPage: number | null }];
  pageParams: [undefined | number];
}

export interface ConversationSchema {
  _id: string;
  lastMessage: {
    sender: User | string;
    text: string;
    messageType: string;
    lastMessageCreatedAt: Date;
  };
}
export interface BasePrivateChatSchema<> {}
export interface BasePublicChatSchema<> {}

export interface BaseGroupChatSchema<
  AdminUserType = string,
  MemberUserType = string
> {
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
