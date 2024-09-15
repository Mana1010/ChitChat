"use client";
import { serverUrl } from "@/utils/serverUrl";
import axios, { AxiosError } from "axios";
import React, { useRef } from "react";
import { useEffect } from "react";
import { useQuery, UseQueryResult, useQueryClient } from "react-query";
import { useSession } from "next-auth/react";
import { Conversation } from "@/types/UserTypes";
import emptyChatImg from "../../../../../assets/images/empty-chat.png";
import noSearchFoundImg from "../../../../../assets/images/not-found.png";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSocketStore } from "@/utils/store/socket.store";
import { motion } from "framer-motion";
import ConversationListSkeleton from "@/app/chats/_components/ConversationListSkeleton";
function ChatList({
  searchChat,
  conversationId,
}: {
  searchChat: string;
  conversationId: string;
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
    socket.on("display-updated-chatlist", ({ newMessage, conversationId }) => {
      queryClient.setQueryData<Conversation[] | undefined>(
        ["chat-list"],
        (prevData) => {
          if (prevData) {
            return prevData
              .map((conversation: Conversation) => {
                if (conversation._id === conversationId) {
                  return {
                    ...conversation,
                    lastMessage: newMessage,
                    updatedAt: new Date().toString(),
                  };
                } else {
                  return conversation;
                }
              })
              .sort(
                (a, b) =>
                  new Date(b.updatedAt).getTime() -
                  new Date(a.updatedAt).getTime()
              );
          } else {
            return [];
          }
        }
      );
    });
    socket.on("seen-message", (data) => {});
    return () => {
      socket.off("display-updated-chatlist");
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
            <motion.button
              onClick={() =>
                router.push(`/chats/private/${user._id}?type=chats`)
              }
              layout
              key={index}
              className={`flex items-center w-full p-3.5 cursor-pointer hover:bg-[#414141] rounded-lg justify-between ${
                user._id === conversationId && "bg-[#414141]"
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
                  <small className="text-zinc-300 text-[0.75rem] break-all">
                    {user.lastMessage.length >= 30
                      ? `${user.lastMessage.slice(0, 30)}...`
                      : user.lastMessage}
                  </small>
                </div>
              </div>
              <div className="w-2.5 h-2.5 rounded-full flex items-center justify-center bg-[#6486FF]"></div>
            </motion.button>
          ))}{" "}
        </div>
      )}
    </div>
  );
}

export default ChatList;
