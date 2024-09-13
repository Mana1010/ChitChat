"use client";
import axios, { AxiosError } from "axios";
import React, { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient, UseQueryResult } from "react-query";
import { useSession } from "next-auth/react";
import { serverUrl } from "@/utils/serverUrl";
import Image from "next/image";
import { HiOutlineDotsCircleHorizontal } from "react-icons/hi";
import NewUser from "./NewUser";
import UserNotFound from "./UserNotFound";
import emptyChat from "../../../../../assets/images/empty-chat.png";
import Picker from "emoji-picker-react";
import { MdEmojiEmotions } from "react-icons/md";
import { LuSend } from "react-icons/lu";
import { ConversationAndMessagesSchema, Messages } from "@/types/UserTypes";
import { useSocketStore } from "@/utils/store/socket.store";

function Chatboard({ conversationId }: { conversationId: string }) {
  const { socket } = useSocketStore();
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [message, setMessage] = useState<string>("");
  const [openEmoji, setOpenEmoji] = useState(false);
  const { data: session, status } = useSession();
  const getReceiverInfoAndChats: UseQueryResult<
    ConversationAndMessagesSchema,
    AxiosError<{ message: string }>
  > = useQuery({
    queryKey: ["message", conversationId],
    queryFn: async () => {
      const response = await axios.get(
        `${serverUrl}/api/messages/receiver-info/${session?.user.userId}/conversation/${conversationId}`
      );
      return response.data.message;
    },
    refetchOnWindowFocus: false,
    enabled: status === "authenticated",
  });
  const queryClient = useQueryClient();
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ block: "end" });
  }, [getReceiverInfoAndChats.data?.getMessages]);
  useEffect(() => {
    if (!socket) return;
    socket.emit("join-room", conversationId);
    socket.on("display-message", (data: Messages) => {
      queryClient.setQueryData<ConversationAndMessagesSchema | undefined | any>(
        ["message", conversationId],
        (cachedData: any) => {
          const { getMessages } = cachedData || {};
          return { ...cachedData, getMessages: [...getMessages, data] };
        }
      );
    });
    return () => {
      socket.off("display-message");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket]);
  useEffect(() => {
    if (status === "authenticated") {
    }
  }, [queryClient, status]);
  if (getReceiverInfoAndChats.isLoading) {
    return <h1>Loading asf</h1>;
  }
  if (conversationId.toLowerCase() === "new") {
    return <NewUser />;
  }
  if (getReceiverInfoAndChats.isError) {
    const error = getReceiverInfoAndChats.error as AxiosError;
    console.log(error);
    if (error.response?.status === 404) {
      return <UserNotFound />;
    }
  }
  return (
    <div
      onClick={() => setOpenEmoji(false)}
      className="flex flex-grow w-full h-full flex-col"
    >
      <header className="w-full shadow-md py-3 px-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-[40px] h-[40px] relative rounded-full">
            <Image
              src={
                getReceiverInfoAndChats.data?.getUserInfo?.receiver_details
                  .profilePic || emptyChat
              }
              alt="profile-image"
              fill
              sizes="100%"
              priority
              className="rounded-full absolute"
            />
            <span
              className={`${
                getReceiverInfoAndChats.data?.getUserInfo?.receiver_details
                  .status === "Online"
                  ? "bg-green-500"
                  : "bg-zinc-500"
              } absolute bottom-[2px] right-[2px] w-2 h-2 rounded-full`}
            ></span>
          </div>
          <div>
            <h3 className="text-white text-sm">
              {getReceiverInfoAndChats.data?.getUserInfo?.receiver_details.name}
            </h3>
            <small className="text-slate-300">
              {getReceiverInfoAndChats.data?.getUserInfo?.receiver_details
                .status === "Online"
                ? "Active Now"
                : "Offline"}
            </small>
          </div>
        </div>
        <button className="text-[1.5rem] text-[#6486FF]">
          <HiOutlineDotsCircleHorizontal />
        </button>
      </header>
      <div className="flex-grow w-full p-3">
        <div className="w-full max-h-[430px] overflow-y-auto flex flex-col space-y-3">
          {getReceiverInfoAndChats.data?.getMessages.map((data: Messages) => (
            <div
              key={data._id}
              className={`flex space-x-2 w-full relative z-10 ${
                data.sender._id === session?.user.userId
                  ? "justify-end"
                  : "justify-start"
              }`}
            >
              <div
                className={`w-1/2 flex ${
                  data.sender._id === session?.user.userId
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
                  className={`flex items-end gap-1  ${
                    data.sender._id !== session?.user.userId &&
                    "flex-row-reverse"
                  }`}
                >
                  <div className="flex flex-col">
                    <small
                      className={`font-semibold text-[0.7rem] text-white ${
                        data.sender._id === session?.user.userId && "text-end"
                      }`}
                    >
                      {data?.sender?.name.split(" ")[0] ?? ""}
                    </small>
                    {/* ChatBox */}

                    <div
                      className={`p-2 rounded-md flex items-center justify-center break-all ${
                        data.sender._id === session?.user.userId
                          ? "bg-[#6486FF]"
                          : "bg-[#171717]"
                      }`}
                    >
                      <span className="text-white">{data?.message}</span>
                    </div>
                  </div>
                  <div className="w-[32px] h-[32px] rounded-full relative px-4 py-2">
                    <Image
                      src={data.sender.profilePic ?? emptyChat}
                      alt="profile-pic"
                      fill
                      sizes="100%"
                      className="rounded-full absolute"
                      priority
                    />
                    <span
                      className={`w-2 h-2 ${
                        data.sender.status === "Online"
                          ? "bg-green-500"
                          : "bg-slate-500"
                      } rounded-full absolute right-[1px] bottom-[2px]`}
                    ></span>
                  </div>
                </div>
              </div>
            </div>
          ))}
          <div ref={scrollRef} className="relative top-5"></div>
        </div>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          socket?.emit("send-message", {
            message,
            conversationId,
          });
          queryClient.setQueryData<ConversationAndMessagesSchema | undefined>(
            ["message", conversationId],
            (data: any) => {
              const { getMessages } = data || {};
              if (getMessages) {
                return {
                  ...data,
                  getMessages: [
                    ...getMessages,
                    {
                      message,
                      sender: {
                        name: session?.user.name.split(" ")[0],
                        status: "Online",
                        profilePic: session?.user.image,
                        _id: session?.user.userId,
                      },
                      isRead: false,
                    },
                  ],
                };
              } else {
                return {
                  ...data,
                  getMessages: [
                    {
                      message,
                      sender: {
                        name: session?.user.name.split(" ")[0],
                        status: "Online",
                        profilePic: session?.user.image,
                        _id: session?.user.userId,
                      },
                      isRead: false,
                    },
                  ],
                };
              }
            }
          );
          setMessage("");
        }}
        className="px-3 py-2.5 flex items-center space-x-2 bg-[#171717]"
      >
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          type="text"
          placeholder="Send a message"
          className="rounded-md bg-[#414141] flex-grow px-3 py-2.5 text-white"
        />
        <div className="relative">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setOpenEmoji((prev) => !prev);
            }}
            className={`px-3 flex py-3 rounded-md items-center text-[#6486FF] text-xl ${
              openEmoji ? "bg-[#6486FF]/20" : "bg-[#3A3B3C]"
            }`}
          >
            <MdEmojiEmotions />
          </button>
          <div
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <Picker
              style={{
                position: "absolute",
                bottom: "52px",
                right: "0",
                zIndex: "100000",
              }}
              onEmojiClick={(emoji) => {
                setMessage((prev) => `${prev}${emoji.emoji}`);
              }}
              open={openEmoji}
              theme="dark"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={!message.trim()}
          className="px-5 flex space-x-2 bg-[#6486FF] py-2.5 rounded-md items-center text-zinc-200 disabled:bg-slate-700 disabled:text-zinc-400"
        >
          <span>
            <LuSend />
          </span>
          <span className="font-bold">Send</span>
        </button>
      </form>
    </div>
  );
}

export default Chatboard;
