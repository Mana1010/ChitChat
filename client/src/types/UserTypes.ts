import React from "react";

export interface User {
  name: string;
  profilePic: string;
  _id: string;
  status: string;
  userId?: string;
}
export interface FullInfoUser extends User {
  provider: string;
  email: string;
  bio: string;
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
    messageType: string;
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
export interface Reaction<ReactionType = string> {
  reactor: ReactionType;
  reactionEmoji: string;
  reactionCreatedAt: string;
}
export interface PublicMessages<UserType = string> {
  _id: string;
  sender: UserType;
  message: string;
  createdAt: string;
  isMessageDeleted: boolean;
  reactions: Reaction[];
}
export interface GetParticipantInfo {
  _id: string;
  receiver_details: FullInfoUser;
  hasUnreadMessages: {
    user: User | string;
    totalUnreadMessages: number;
  };
}

export interface InfiniteScrollingMessageSchema {
  pages: [{ getMessages: Messages[]; nextPage: number | null }];
  pageParams: [undefined | number];
}

export interface ReactionSchema {
  emoji: string;
  name: string;
  id: string;
}
export interface ReactionListSchema {
  _id: string;
  reactions: Reaction;
  reactor_details: {
    name: string;
    profilePic: string;
  };
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
