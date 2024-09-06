"use client";
import axios, { AxiosError } from "axios";
import React, { useEffect, useRef, useState } from "react";
import { useQuery } from "react-query";
import { initializePrivateChatSocket } from "@/utils/socket";
import { Socket } from "socket.io-client";
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

function Chatboard({ conversationId }: { conversationId: string }) {
  const [getAllMessage, setGetAllMessage] = useState<any[]>([]);
  const socketRef = useRef<Socket | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [message, setMessage] = useState<string>("");
  const [openEmoji, setOpenEmoji] = useState(false);
  const { data: session, status } = useSession();
  const getReceiverInfoAndChats = useQuery({
    queryKey: ["message", conversationId],
    queryFn: async () => {
      const response = await axios.get(
        `${serverUrl}/api/messages/receiver-info/${conversationId}`
      );
      // setGetAllMessage(response.data.message.getMessages);
      return response.data.message.getUserInfo;
    },
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (!socketRef.current && session?.user) {
      const socket = initializePrivateChatSocket(session.user.userId as string);
      socketRef.current = socket;
      socket.on("connect", () => console.log("Connected Successfully"));
    }
  }, [session?.user]);

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
  console.log(getAllMessage);
  return (
    <div
      onClick={() => setOpenEmoji(false)}
      className="flex flex-grow w-full h-full flex-col"
    >
      <header className="w-full shadow-md py-3 px-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-[40px] h-[40px] relative rounded-full">
            <Image
              src={getReceiverInfoAndChats.data?.profilePic || emptyChat}
              alt="profile-image"
              fill
              sizes="100%"
              priority
              className="rounded-full absolute"
            />
            <span
              className={`${
                getReceiverInfoAndChats.data?.status === "Online"
                  ? "bg-green-500"
                  : "bg-zinc-500"
              } absolute bottom-[2px] right-[2px] w-2 h-2 rounded-full`}
            ></span>
          </div>
          <div>
            <h3 className="text-white text-sm">
              {getReceiverInfoAndChats.data?.name}
            </h3>
            <small className="text-slate-300">
              {getReceiverInfoAndChats.data?.status === "Online"
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
        <div className="w-full max-h-[430px] overflow-y-auto flex flex-col space-y-2">
          {getAllMessage.map((data: any) => (
            <div
              key={data._id}
              className={`flex space-x-2 w-full relative z-10 ${
                data.sender === session?.user.userId
                  ? "justify-end"
                  : "justify-start"
              }`}
            >
              <div
                className={`w-1/2 flex ${
                  data.sender === session?.user.userId
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
                  className={`flex items-end gap-1  ${
                    data.sender !== session?.user.userId && "flex-row-reverse"
                  }`}
                >
                  <div className="flex flex-col">
                    <small
                      className={`font-semibold text-[0.7rem] text-white ${
                        data.sender === session?.user.userId && "text-end"
                      }`}
                    >
                      {data?.name?.split(" ")[0] ?? ""}
                    </small>
                    {/* ChatBox */}

                    <div
                      className={`p-2 rounded-md flex items-center justify-center break-all ${
                        data.sender === session?.user.userId
                          ? "bg-[#6486FF]"
                          : "bg-[#222222]"
                      }`}
                    >
                      <span className="text-white">{data?.message}</span>
                    </div>
                  </div>
                  <div className="w-[32px] h-[32px] rounded-full relative px-4 py-2">
                    <Image
                      src={data.profilePic ?? emptyChat}
                      alt="profile-pic"
                      fill
                      sizes="100%"
                      className="rounded-full absolute"
                      priority
                    />
                    <span
                      className={`w-2 h-2 ${
                        data.status === "Online"
                          ? "bg-green-500"
                          : "bg-slate-500"
                      } rounded-full absolute right-[1px] bottom-[2px]`}
                    ></span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (socketRef.current) {
            socketRef.current.emit("send-message", {
              message,
              conversationId,
            });
            setGetAllMessage((prevMessage) => [
              ...prevMessage,
              {
                message,
                name: session?.user.name.split(" ")[0],
                status: "Online",
                profilePic: session?.user.image,
                sender: session?.user.userId,
              },
            ]);
            setMessage("");
          }
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
