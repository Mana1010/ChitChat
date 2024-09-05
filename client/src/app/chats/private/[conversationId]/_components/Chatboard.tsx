"use client";
import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { useQuery } from "react-query";
import { initializePrivateChatSocket } from "@/utils/socket";
import { Socket } from "socket.io-client";
import { useSession } from "next-auth/react";
import { serverUrl } from "@/utils/serverUrl";
import Image from "next/image";
import { HiOutlineDotsCircleHorizontal } from "react-icons/hi";
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
  });

  useEffect(() => {
    if (!socketRef.current && status === "authenticated") {
      const socket = initializePrivateChatSocket(session.user.userId as string);
      socketRef.current = socket;
      socket.on("connect", () => console.log("Connected Successfully"));
    }
  }, [session?.user, status]);
  return (
    <div className="flex flex-grow w-full h-full flex-col">
      <header className="w-full shadow-md py-3 px-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Image
            src={getReceiverInfoAndChats.data?.profilePic || ""}
            alt="profile-image"
            width={40}
            height={40}
            priority
            className="rounded-full"
          />
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
