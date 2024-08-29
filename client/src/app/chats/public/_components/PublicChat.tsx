"use client";
import React, { useEffect, useRef, useState } from "react";
import { LuSend } from "react-icons/lu";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { io, Socket } from "socket.io-client";
import { useQuery } from "react-query";
import { serverUrl } from "@/utils/serverUrl";
import axios from "axios";
import { User } from "@/types/next-auth";
import authOptions from "@/utils/authOption";
import { initializeSocket } from "@/utils/socket";
import Image from "next/image";
import themeImg from "../../../../assets/images/theme-img.png";
function PublicChat() {
  const [message, setMessage] = useState("");
  const [allMessages, setAllMessages] = useState<any>([]);
  // const [socketPublic, setSocket] = useState<Socket | null>(null);
  const socketRef = useRef<Socket | null>();
  const [isConnected, setIsConnected] = useState(false);
  const { status, data: session } = useSession();
  const getAllMessage = useQuery({
    queryKey: ["public-messages"],
    queryFn: async () => {
      const response = await axios.get(`${serverUrl}/api/messages/public`);
      setAllMessages(response.data.message);
      console.log(response.data.message);
      return;
    },
  });

  useEffect(() => {
    function onDisconnect() {
      setIsConnected(false);
    }

    if (!socketRef.current && session?.user) {
      const socket = initializeSocket(session?.user as User);
      socket.on("connect", () => {
        socketRef.current = socket;
      });
      socket.on("disconnect", onDisconnect);
    }

    return () => {
      // socket.off("connect", onConnect);
      // socket.off("disconnect", onDisconnect);
    };
  }, [session?.user]);
  useEffect(() => {
    // if (!socketRef.current) return;
    socketRef.current?.on("get-message", (data: User) => {
      setAllMessages((messages: any) => [...messages, data]);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socketRef.current]);
  if (getAllMessage.isLoading) {
    return <h1>Loading</h1>;
  }
  console.log(allMessages);
  const userData = {
    name: session?.user.name,
    email: session?.user.email,
    profilePic: session?.user.image,
    authId: session?.user.id,
    provider: session?.user.provider,
    _id: session?.user.userId,
  };
  return (
    <div className="h-full">
      <div className="h-[440px] bg-[#3A3B3C] w-full rounded-md relative">
        <div className="w-full space-y-2 p-3 overflow-y-auto h-full">
          {allMessages.map((data: any) => (
            <div
              key={data._id}
              className={`flex space-x-2 w-full relative z-10 ${
                data.userId?._id === session?.user.userId
                  ? "justify-end"
                  : "justify-start"
              }`}
            >
              <div
                className={`flex items-end gap-1 ${
                  data.userId?._id !== session?.user.userId &&
                  "flex-row-reverse"
                }`}
              >
                <div className="flex flex-col">
                  <small
                    className={`font-semibold text-[0.7rem] text-white ${
                      data.userId?._id === session?.user.userId && "text-end"
                    }`}
                  >
                    {data.userId?.name.split(" ")[0]}
                  </small>
                  {/* ChatBox */}

                  <div
                    className={`p-2 rounded-md ${
                      data.userId?._id === session?.user.userId
                        ? "bg-[#6486FF]"
                        : "bg-[#171717]"
                    }`}
                  >
                    <span className="text-white text-center">
                      {data?.message}
                    </span>
                  </div>
                </div>
                <Image
                  src={data.userId?.profilePic ?? ""}
                  alt="profile-pic"
                  width={32}
                  height={32}
                  className="rounded-full "
                  priority
                />
              </div>
            </div>
          ))}
        </div>
        <div className="absolute bottom-3 right-2 opacity-60">
          <Image
            src={themeImg}
            alt="chat-bot-img"
            priority
            width={200}
            height={200}
          />
        </div>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          socketRef.current?.emit("send-message", message);
          setAllMessages([
            ...allMessages,
            { message, userId: userData, isMessageDeleted: false },
          ]);
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
