"use client";
import { serverUrl } from "@/utils/serverUrl";
import axios, { AxiosError } from "axios";
import React from "react";
import { useEffect } from "react";
import { useQuery, UseQueryResult, useQueryClient } from "react-query";
import { useSession } from "next-auth/react";
import { Conversation } from "@/types/UserTypes";
import emptyChatImg from "../../../../../assets/images/empty-chat.png";
import noSearchFoundImg from "../../../../../assets/images/not-found.png";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSocketStore } from "@/utils/store/socket.store";
import ConversationListSkeleton from "@/app/chats/_components/ConversationListSkeleton";
function ChatList({
  searchChat,
  groupId,
}: {
  searchChat: string;
  groupId: string;
}) {
  const { socket } = useSocketStore();
  const { data: session, status } = useSession();
  const router = useRouter();
  const displayAllChats: UseQueryResult<
    Conversation[],
    AxiosError<{ message: string }>
  > = useQuery({
    queryKey: ["chat-list"],
    queryFn: async () => {
      const response = await axios.get(
        `${serverUrl}/api/messages/chat-list/${session?.user.userId}`
      );
      return response.data.message;
    },
    enabled: status === "authenticated",
  });
  const queryClient = useQueryClient();
  useEffect(() => {
    if (!socket || status === "unauthenticated") return;
    socket.on(
      "display-updated-chatlist",
      ({
        newMessage,
        messageType,
        conversationId,
        participantId,
        lastMessageCreatedAt,
      }) => {
        queryClient.setQueryData<Conversation[] | undefined>(
          ["chat-list"],
          (prevData) => {
            if (prevData) {
              return prevData
                .map((conversation: Conversation) => {
                  if (conversation._id === conversationId) {
                    return {
                      ...conversation,
                      lastMessage: {
                        sender: participantId,
                        text: newMessage,
                        messageType,
                        lastMessageCreatedAt,
                      },
                    };
                  } else {
                    return conversation;
                  }
                })
                .sort(
                  (a, b) =>
                    new Date(b.lastMessage.lastMessageCreatedAt).getTime() -
                    new Date(a.lastMessage.lastMessageCreatedAt).getTime()
                );
            } else {
              return [];
            }
          }
        );
      }
    );
    socket.on("seen-message", ({ conversationId, hasUnreadMessages }) => {
      queryClient.setQueryData<Conversation[] | undefined>(
        ["chat-list"],
        (cachedData) => {
          if (cachedData) {
            return cachedData.map((conversation: Conversation) => {
              if (conversation._id === conversationId) {
                return {
                  ...conversation,
                  hasUnreadMessages: {
                    user: hasUnreadMessages.user,
                    totalUnreadMessages: hasUnreadMessages.totalUnreadMessages,
                  },
                };
              } else {
                return conversation;
              }
            });
          }
        }
      );
    });
    return () => {
      socket.off("display-updated-chatlist");
      socket.off("seen-message");
    };
  }, [queryClient, socket, status]);
  if (displayAllChats.isLoading) {
    return <ConversationListSkeleton />;
  }
  const searchResult = displayAllChats.data?.filter((user) =>
    new RegExp(searchChat, "i").test(user.receiver_details.name as string)
  );
  return (
    <div className="w-full flex-grow flex">
      {displayAllChats.data?.length === 0 && searchChat.length === 0 ? (
        <div className="flex items-center w-full justify-center flex-col space-y-2 px-2">
          {" "}
          <Image
            src={emptyChatImg}
            width={100}
            height={100}
            alt="empty-chat-img"
            priority
          />
          <h2 className="text-zinc-300 text-[1.1rem] break-all text-center">
            You have no conversation yet
          </h2>
        </div>
      ) : searchChat?.length !== 0 && searchResult?.length === 0 ? (
        <div className="flex items-center w-full justify-center flex-col space-y-2 px-2">
          {" "}
          <Image
            src={noSearchFoundImg}
            width={100}
            height={100}
            alt="no-search-found"
            priority
          />
          <h2 className="text-zinc-300 text-[1.1rem] break-all text-center">
            No &quot;
            <span className="text-[#6486FF]">{searchChat.slice(0, 10)}</span>
            &quot; user found
          </h2>
        </div>
      ) : (
        <div className="pt-2 flex flex-col w-full overflow-y-auto h-full items-center px-1.5">
          {searchResult?.map((user: Conversation, index: number) => (
            <button
              onClick={() =>
                router.push(`/chats/private/${user._id}?type=chats`)
              }
              key={index}
              className={`flex items-center w-full p-3.5 cursor-pointer hover:bg-[#414141] rounded-lg justify-between ${
                user._id === groupId && "bg-[#414141]"
              }`}
            >
              <div className="flex items-center space-x-2">
                <div className="w-[40px] h-[40px] relative rounded-full pr-2">
                  <Image
                    src={user.receiver_details.profilePic}
                    alt="profile-pic"
                    fill
                    sizes="100%"
                    priority
                    className="rounded-full absolute"
                  />
                  <span
                    className={`${
                      user.receiver_details.status === "Online"
                        ? "bg-green-500"
                        : "bg-zinc-500"
                    } absolute bottom-[3px] right-[2px] w-2 h-2 rounded-full`}
                  ></span>
                </div>{" "}
                <div className="flex justify-start flex-col items-start">
                  <h1 className="text-white font-bold text-sm break-all">
                    {user.receiver_details?._id === session?.user.userId
                      ? "You"
                      : user.receiver_details.name}
                  </h1>
                  <small
                    className={`text-[0.75rem] break-all ${
                      user.hasUnreadMessages.user === session?.user.userId &&
                      user.hasUnreadMessages.totalUnreadMessages !== 0
                        ? "text-white font-bold"
                        : "text-zinc-300"
                    }`}
                  >
                    {`${
                      user.lastMessage.sender === session?.user.userId
                        ? "You:"
                        : ""
                    } ${
                      user.lastMessage.text.length >= 30
                        ? `${user.lastMessage?.text?.slice(0, 30)}...`
                        : user.lastMessage?.text
                    }`}
                  </small>
                </div>
              </div>
              <div
                className={`w-2.5 h-2.5 rounded-full items-center justify-center bg-[#6486FF] ${
                  user.hasUnreadMessages.user === session?.user.userId &&
                  user.hasUnreadMessages.totalUnreadMessages !== 0
                    ? "flex"
                    : "hidden"
                }`}
              ></div>
            </button>
          ))}{" "}
        </div>
      )}
    </div>
  );
}

export default ChatList;
