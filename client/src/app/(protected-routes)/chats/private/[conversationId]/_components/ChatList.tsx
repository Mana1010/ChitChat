"use client";
import { PRIVATE_SERVER_URL } from "@/utils/serverUrl";
import axios, { AxiosError } from "axios";
import React, { ReactNode, useRef } from "react";
import { useEffect } from "react";
import { useQuery, UseQueryResult, useQueryClient } from "react-query";
import { useSession } from "next-auth/react";
import { Conversation } from "@/types/private.types";
import EmptyConversation from "@/components/EmptyConversation";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSocketStore } from "@/utils/store/socket.store";
import ConversationListSkeleton from "../../../_components/ConversationListSkeleton";
import NoItemFound from "@/components/NoItemFound";
import { updateConversationList } from "@/utils/sharedUpdateFunction";
import debounceScroll from "@/utils/debounceScroll";
import {
  PRIVATE_CHATLIST_SESSION_KEY,
  DEFAULT_SCROLL_VALUE,
} from "@/utils/storageKey";
function ParentDiv({ children }: { children: ReactNode }) {
  return <div className="flex-grow h-1">{children}</div>;
}
function ChatList({
  searchChat,
  conversationId,
}: {
  searchChat: string;
  conversationId: string;
}) {
  const { privateSocket, statusSocket } = useSocketStore();
  const { data: session, status } = useSession();
  const chatListRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();
  const debounce = debounceScroll(PRIVATE_CHATLIST_SESSION_KEY);
  const displayAllChats: UseQueryResult<
    Conversation[],
    AxiosError<{ message: string }>
  > = useQuery({
    queryKey: ["chat-list"],
    queryFn: async () => {
      const response = await axios.get(
        `${PRIVATE_SERVER_URL}/all/chat/list/${session?.user.userId}`
      );
      return response.data.message;
    },
    enabled: status === "authenticated",
  });
  const queryClient = useQueryClient();

  useEffect(() => {
    if (chatListRef.current) {
      const scrollPosition = sessionStorage.getItem(
        PRIVATE_CHATLIST_SESSION_KEY
      )
        ? JSON.parse(sessionStorage.getItem(PRIVATE_CHATLIST_SESSION_KEY) || "")
        : sessionStorage.setItem(
            PRIVATE_CHATLIST_SESSION_KEY,
            DEFAULT_SCROLL_VALUE
          );
      chatListRef.current.scrollTop = scrollPosition;
    }
  }, []);

  useEffect(() => {
    if (!privateSocket || status === "unauthenticated") return;
    privateSocket.on(
      "display-updated-chatlist",
      ({
        newMessage,
        messageType,
        conversationId,
        participantId,
        lastMessageCreatedAt,
      }) => {
        updateConversationList(
          queryClient,
          newMessage,
          conversationId,
          participantId,
          messageType,
          "chat-list",
          false,
          lastMessageCreatedAt,
          { _id: participantId }
        );
      }
    );
    privateSocket.on("add-chatlist", (conversationDetails: Conversation) => {
      queryClient.setQueryData<Conversation[] | undefined>(
        ["chat-list"],
        (cachedData) => {
          if (cachedData) {
            return [conversationDetails, ...cachedData];
          }
        }
      );
    });

    return () => {
      privateSocket.off("add-chatlist");
      privateSocket.off("display-updated-chatlist");
      privateSocket.off("seen-message");
    };
  }, [queryClient, privateSocket, status]);

  useEffect(() => {
    if (statusSocket) {
      statusSocket.on(
        "display-user-status",
        ({ userId, status: { type, lastActiveAt } }) => {
          queryClient.setQueryData<Conversation[] | undefined>(
            ["chat-list"],
            (cachedData: any) => {
              if (cachedData) {
                return cachedData.map((chatlist: Conversation) => {
                  if (chatlist.participant_details._id === userId) {
                    return {
                      ...chatlist,
                      receiver_details: {
                        ...chatlist.participant_details,
                        status: {
                          type,
                          lastActiveAt,
                        },
                      },
                    };
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
      );
    }
    return () => {
      statusSocket?.off("display-user-status");
    };
  }, [queryClient, statusSocket]);

  const searchResult = displayAllChats.data?.filter((user) =>
    new RegExp(searchChat, "i").test(user.participant_details.name as string)
  );

  if (displayAllChats.isLoading) {
    return <ConversationListSkeleton />;
  }

  if (displayAllChats.data?.length === 0 && searchChat.length === 0) {
    return (
      <ParentDiv>
        <EmptyConversation>
          <h2 className="text-zinc-300 text-[1.1rem] break-all text-center">
            Your conversation list is empty.
          </h2>
        </EmptyConversation>
      </ParentDiv>
    );
  }

  if (searchChat?.length !== 0 && searchResult?.length === 0) {
    return (
      <ParentDiv>
        <NoItemFound>
          No &quot;
          <span className="text-[#6486FF]">{searchChat.slice(0, 10)}</span>
          &quot; user found
        </NoItemFound>
      </ParentDiv>
    );
  }

  return (
    <ParentDiv>
      <div
        ref={chatListRef}
        onScroll={(e) => {
          if (chatListRef.current) {
            const scroll = chatListRef.current.scrollTop;
            debounce(scroll, 200);
          }
        }}
        className="pt-2 flex flex-col w-full overflow-y-auto h-full items-center px-1.5"
      >
        {searchResult?.map((user: Conversation, index: number) => (
          <button
            onClick={() => router.push(`/chats/private/${user._id}?type=chats`)}
            key={index}
            className={`flex items-center w-full p-3.5 cursor-pointer hover:bg-[#414141] rounded-lg justify-between ${
              user._id === conversationId && "bg-[#414141]"
            }`}
          >
            <div className="flex items-center space-x-2 w-full overflow-hidden">
              <div className="w-[40px] h-[40px] relative rounded-full pr-2 shrink-0">
                <Image
                  src={user.participant_details.profilePic}
                  alt="profile-pic"
                  fill
                  sizes="100%"
                  priority
                  className="rounded-full absolute"
                />
                <span
                  className={`${
                    user.participant_details.status.type === "online"
                      ? "bg-green-500"
                      : "bg-zinc-500"
                  } absolute bottom-[3px] right-[2px] w-2 h-2 rounded-full`}
                ></span>
              </div>{" "}
              <div className="flex justify-start flex-col items-start w-full overflow-hidden">
                <h1 className="text-white font-bold text-sm truncate w-[90%] text-start">
                  {user.participant_details.name}
                </h1>
                <small
                  className={`text-[0.75rem] truncate w-[90%] text-start ${
                    !user.already_read_message
                      ? "text-white font-bold"
                      : "text-zinc-300"
                  }`}
                >
                  {`${
                    user.lastMessage.sender._id === session?.user.userId &&
                    user.lastMessage.type === "text"
                      ? "You:"
                      : ""
                  } ${user.lastMessage?.text}`}
                </small>
              </div>
            </div>
            <div
              className={`w-2.5 h-2.5 rounded-full items-center justify-center bg-[#6486FF] ${
                !user.already_read_message ? "flex" : "hidden"
              }`}
            ></div>
          </button>
        ))}{" "}
      </div>
    </ParentDiv>
  );
}

export default ChatList;
