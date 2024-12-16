import { QueryClient } from "react-query";
import { ConversationSchema, Message, Reaction } from "@/types/shared.types";
import { Conversation } from "@/types/private.types";
import { MailDetailsSchema } from "@/types/app.types";
import React, { Dispatch, SetStateAction } from "react";
import { GroupChatList } from "@/types/group.types";
import { User } from "@/types/shared.types";
import { Session } from "next-auth";
import { nanoid } from "nanoid";
import { SidebarSchema } from "@/types/app.types";
export function updateConversationList<
  ConversationType extends ConversationSchema
>(
  queryClient: QueryClient,
  userMessage: string,
  conversationId: string,
  senderId: string | undefined,
  type: string,
  queryKey: string,
  already_read_message: boolean,
  lastMessageCreatedAt: string | Date = new Date()
) {
  queryClient.setQueryData<ConversationType[] | undefined>(
    [queryKey],
    (cachedData: any) => {
      if (cachedData) {
        return cachedData
          .map((chatlist: ConversationType) => {
            if (chatlist._id === conversationId) {
              return {
                ...chatlist,
                lastMessage: {
                  sender: senderId,
                  text: userMessage,
                  type,
                  lastMessageCreatedAt,
                },
                already_read_message,
              };
            } else {
              return chatlist;
            }
          })
          .sort(
            (a: ConversationType, b: ConversationType) =>
              new Date(b.lastMessage.lastMessageCreatedAt).getTime() -
              new Date(a.lastMessage.lastMessageCreatedAt).getTime()
          );
      }
      return cachedData;
    }
  );
}

export function handleUnreadMessageSign(
  queryClient: QueryClient,
  conversationId: string,
  already_read_message: boolean
) {
  queryClient.setQueryData<Conversation[] | undefined>(
    ["chat-list"],
    (cachedData) => {
      if (cachedData) {
        return cachedData.map((chatlist) => {
          if (chatlist._id === conversationId) {
            return { ...chatlist, already_read_message };
          } else {
            return chatlist;
          }
        });
      } else {
        return cachedData;
      }
    }
  );
}
export function handleSeenUpdate<
  ParticipantType extends { is_user_already_seen_message: boolean }
>(queryClient: QueryClient, queryKey: string[], value: boolean) {
  queryClient.setQueryData<ParticipantType | undefined>(
    queryKey,
    (cachedData: ParticipantType | undefined) => {
      if (cachedData) {
        return {
          ...cachedData,
          is_user_already_seen_message: value,
        };
      } else {
        return cachedData;
      }
    }
  );
}

export function updateMailDetails(
  queryClient: QueryClient,
  mailId: string,
  status: "accepted" | "declined" | "cancelled"
) {
  queryClient.setQueryData<MailDetailsSchema | undefined>(
    ["mail-details", mailId],
    (cachedData) => {
      if (cachedData) {
        return { ...cachedData, status };
      } else {
        return cachedData;
      }
    }
  );
}

export function updateGrouplist(
  groupId: string,
  setAllGroupChatList: Dispatch<SetStateAction<GroupChatList[]>>
) {
  setAllGroupChatList((groupChatList) =>
    groupChatList.map((groupchat) => {
      if (groupchat._id === groupId) {
        return { ...groupchat, user_group_status: "no-status" };
      } else {
        return groupchat;
      }
    })
  );
}

export function optimisticUpdateMessage(
  message: string,
  setAllMessages: Dispatch<
    SetStateAction<Message<User, Reaction[] | string>[]>
  >,
  session: Session | null,
  reactionDefault: string | Reaction[]
) {
  const userData = {
    name: session?.user.name.split(" ")[0],
    profilePic: session?.user.image,
    status: {
      type: "online" as "online",
      lastActiveAt: new Date(),
    },
    _id: session?.user.userId,
  };
  setAllMessages((prevMessages) => {
    return [
      ...prevMessages,
      {
        message,
        sender: userData as User,
        type: "text",
        createdAt: new Date(),
        isMessageDeleted: false,
        _id: nanoid(),
        reactions: reactionDefault,
      },
    ];
  });
}

export function decrementNotificationCount(
  queryClient: QueryClient,
  sidebarKey:
    | "privateNotificationCount"
    | "groupNotificationCount"
    | "mailboxNotificationCount",
  senderId: string
) {
  queryClient.setQueryData<SidebarSchema | undefined>(
    ["sidebar"],
    (cachedData) => {
      const notificationCountIds = new Set(
        cachedData?.userNotificationObj[sidebarKey]
      );

      if (cachedData) {
        if (notificationCountIds.has(senderId)) {
          notificationCountIds.delete(senderId);
          return {
            ...cachedData,
            userNotificationObj: {
              ...cachedData.userNotificationObj,
              [sidebarKey]: Array.from(notificationCountIds),
            },
          };
        } else {
          return cachedData;
        }
      } else {
        return cachedData;
      }
    }
  );
}
