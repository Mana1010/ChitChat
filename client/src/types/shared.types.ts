import { Session } from "next-auth";
import { Dispatch, SetStateAction } from "react";

export interface User {
  name: string;
  profilePic: string;
  _id: string;
  status: {
    type: "offline" | "online";
    lastActiveAt: Date;
  };
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
  type: "system" | "file" | "text";
  reactions: ReactionType;
  createdAt: Date;
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
interface ExtendUser extends User {
  provider: string;
  bio: string;
  email: string;
  createdAt: Date;
}
export interface ProfileDetails {
  participant_details: ExtendUser;
  total_participant_joined_group: number;
  total_participant_private_chat: number;
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

interface MessageFieldRefSchema {
  scrollRef: HTMLDivElement | null;
}

export interface MessageFieldPropsSchema extends MessageFieldRefSchema {
  openEmoji: boolean;
  message: string;
  session: Session | null;
  setAllMessages: Dispatch<
    SetStateAction<Message<User, Reaction[] | string>[]>
  >;
  setOpenEmoji: Dispatch<SetStateAction<boolean>>;
  setMessage: Dispatch<SetStateAction<string>>;
}
