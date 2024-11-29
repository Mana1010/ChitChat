import { QueryClient } from "react-query";
import { ConversationSchema } from "@/types/shared.types";
import { Conversation } from "@/types/private.types";
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
