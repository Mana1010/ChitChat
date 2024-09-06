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
function Chatboard({ conversationId }: { conversationId: string }) {
  const [getAllMessage, setGetAllMessage] = useState([]);
  const socketRef = useRef<Socket | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const { data: session, status } = useSession();
  const getReceiverInfoAndChats = useQuery({
    queryKey: ["message", conversationId],
    queryFn: async () => {
      const response = await axios.get(
        `${serverUrl}/api/messages/receiver-info/${conversationId}`
      );
      setGetAllMessage(response.data.message.getMessages);
      return response.data.message.getUserInfo;
    },
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (!socketRef.current && status === "authenticated") {
      const socket = initializePrivateChatSocket(session.user.userId as string);
      socketRef.current = socket;
      socket.on("connect", () => console.log("Connected Successfully"));
    }
  }, [session?.user, status]);
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
    <div className="flex flex-grow w-full h-full flex-col">
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
      <div className="flex flex-grow">sdsd</div>
    </div>
  );
}

export default Chatboard;
