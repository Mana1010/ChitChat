"use client";
import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { useQuery } from "react-query";
import { initializePrivateChatSocket } from "@/utils/socket";
import { Socket } from "socket.io-client";
import { useSession } from "next-auth/react";
import { serverUrl } from "@/utils/serverUrl";
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
      return response.data.message.getInfo;
    },
  });

  useEffect(() => {
    if (!socketRef.current && status === "authenticated") {
      const socket = initializePrivateChatSocket(session.user.userId as string);
      socketRef.current = socket;
      socket.on("connect", () => console.log("Connected Successfully"));
    }
  }, [session?.user, status]);
  return <div className="text-white">{getReceiverInfoAndChats.data}</div>;
}

export default Chatboard;
