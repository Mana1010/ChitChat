"use client";
import { serverUrl } from "@/utils/serverUrl";
import axios, { AxiosError } from "axios";
import React, { useState } from "react";
import { useEffect } from "react";
import { useQuery, UseQueryResult } from "react-query";
import { useSession } from "next-auth/react";
import { Conversation } from "@/types/UserTypes";
import emptyChatImg from "../../../../../assets/images/empty-chat.png";
import noSearchFoundImg from "../../../../../assets/images/not-found.png";
import Image from "next/image";
function ChatList({ searchChat }: { searchChat: string }) {
  const { data: session } = useSession();
  const [chats, setChats] = useState<Conversation[]>([]);
  const displayAllChats: UseQueryResult<
    Conversation[],
    AxiosError<{ message: string }>
  > = useQuery({
    queryKey: ["chat-list"],
    queryFn: async () => {
      const response = await axios.get(
        `${serverUrl}/api/messages/chat-list/${session?.user.userId}`
      );
      setChats(response.data.message);
      return response.data.message;
    },
  });
  useEffect(() => {
    const searchResult = displayAllChats.data?.filter((user) =>
      new RegExp(searchChat, "i").test(user.userId.name as string)
    );
    setChats(searchResult as Conversation[]);
  }, [searchChat, displayAllChats.data]);
  const searchResult = displayAllChats.data?.filter((user) =>
    new RegExp(searchChat, "i").test(user.userId.name as string)
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
        <div className="pt-2 flex flex-col w-full overflow-y-auto h-full items-center">
          {chats?.map((user: Conversation, index: number) => (
            <div
              key={index}
              className="flex items-center w-full p-3.5 cursor-pointer hover:bg-black/40 rounded-lg justify-between"
            >
              <div className="flex items-center space-x-2">
                <div className="w-[40px] h-[40px] relative rounded-full">
                  <Image
                    src={user.userId.profilePic}
                    alt="profile-pic"
                    fill
                    sizes="100%"
                    priority
                    className="rounded-full absolute"
                  />
                  <span
                    className={`${
                      user.userId.status === "Online"
                        ? "bg-green-500"
                        : "bg-zinc-500"
                    } absolute bottom-[3px] right-[2px] w-2 h-2 rounded-full`}
                  ></span>
                </div>{" "}
                <h1 className="text-white font-bold text-sm break-all">
                  {user.userId._id === session?.user.userId
                    ? "You"
                    : user.userId.name}
                </h1>
              </div>
            </div>
          ))}{" "}
        </div>
      )}
    </div>
  );
}

export default ChatList;
