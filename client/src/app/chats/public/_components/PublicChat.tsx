"use client";
import React, { useEffect, useState } from "react";
import { LuSend } from "react-icons/lu";
import { initializeSocket } from "@/utils/socket";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { Socket } from "socket.io-client";
import { useQuery } from "react-query";
import { serverUrl } from "@/utils/serverUrl";
import axios from "axios";
import { User } from "@/types/next-auth";
function PublicChat({ allMessage }: any) {
  const [message, setMessage] = useState("");
  const [allMessages, setAllMessages] = useState<any>([]);
  const [socketPublic, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { status, data: session } = useSession();
  useEffect(() => {
    const socket = initializeSocket(session?.user as User);
    setSocket(socket);
    function onConnect() {
      setIsConnected(true);
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, [
    isConnected,
    session?.user,
    session?.user.id,
    session?.user.userId,
    status,
  ]);
  useEffect(() => {
    socketPublic?.on("get-message", (data: { message: string; data: User }) => {
      setAllMessages((allMessage: any) => [...allMessage, data]);
    });
  }, [socketPublic]);
  console.log(allMessages);
  return (
    <div className="h-full relative">
      <div className="h-[440px] bg-[#3A3B3C] w-full rounded-md p-3 overflow-y-auto">
        <div className="w-full space-y-2">
          {allMessages.map((data: any) => (
            <div
              key={data._id}
              className={`flex space-x-2 w-full ${
                data.data.id === session?.user.id
                  ? "justify-end items-end"
                  : "justify-start items-start"
              }`}
            >
              {/* ChatBox */}
              <div
                className={`p-2 rounded-md ${
                  data.data.id === session?.user.id
                    ? "bg-[#6486FF]"
                    : "bg-[#171717]"
                }`}
              >
                <span className="text-white">{data.message}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          socketPublic?.emit("send-message", message);
          setMessage("");
        }}
        className="flex-grow flex space-x-2 items-center pt-3 justify-between"
      >
        <input
          onChange={(e) => setMessage(e.target.value)}
          value={message}
          type="text"
          placeholder="Send a message"
          className="text-zinc-100 placeholder:text-zinc-300 py-3 rounded-md bg-[#3A3B3C] px-3 flex-grow"
        />
        <button
          type="submit"
          disabled={!message.trim()}
          className="px-5 flex space-x-2 bg-[#6486FF] py-3 rounded-md items-center text-zinc-200 disabled:bg-slate-700 disabled:text-zinc-400"
        >
          <span>
            <LuSend />
          </span>
          <span className="font-bold">Send Message</span>
        </button>
      </form>
    </div>
  );
}

export default PublicChat;
