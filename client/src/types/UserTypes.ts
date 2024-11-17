import React from "react";
import { User } from "./shared.types";
import { Reaction } from "./shared.types";
export interface FullInfoUser extends User {
  provider: string;
  email: string;
  bio: string;
}

export interface Conversation {
  receiver_details: User;
  _id: string;
  is_user_read_message: boolean;
  // userReadMessage: string[];
  lastMessage: {
    sender: User | string;
    text: string;
    type: string;
    lastMessageCreatedAt: Date;
  };
  updatedAt: string;
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
  is_user_already_seen_message: boolean;
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
