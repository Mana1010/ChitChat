import { QueryClient } from "react-query";
import { any } from "zod";
import { ConversationSchema } from "@/types/shared.types";
export function updateConversationList<
  ConversationType extends ConversationSchema
>(
  queryClient: QueryClient,
  userMessage: string,
  conversationId: string,
  senderId: string | undefined,
  type: string,
  queryKey: string,
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
