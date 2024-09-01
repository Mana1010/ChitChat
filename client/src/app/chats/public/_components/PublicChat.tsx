"use client";
import React, { useEffect, useRef, useState } from "react";
import { LuSend } from "react-icons/lu";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { Socket } from "socket.io-client";
import { useQuery } from "react-query";
import { serverUrl } from "@/utils/serverUrl";
import axios from "axios";
import { User } from "@/types/next-auth";
import { initializeSocket } from "@/utils/socket";
import Image from "next/image";
import themeImg from "../../../../assets/images/theme-img.png";
import { MdEmojiEmotions } from "react-icons/md";
import Picker from "emoji-picker-react";

function PublicChat() {
  const [message, setMessage] = useState("");
  const [allMessages, setAllMessages] = useState<any>([]);
  const socketRef = useRef<Socket | null>();
  const { status, data: session } = useSession();
  const [scrollPosition, setScrollPosition] = useState();
  const [openEmoji, setOpenEmoji] = useState(false);
  const [typingUsers, setTypingUsers] = useState<
    { socketId: string; userImg: string }[]
  >([]);
  const scrollRef = useRef<any>();
  const getAllMessage = useQuery({
    queryKey: ["public-messages"],
    queryFn: async () => {
      const response = await axios.get(`${serverUrl}/api/messages/public`);
      setAllMessages(response.data.message);
      return;
    },
  });

  useEffect(() => {
    //To activate the dotWave animation
    function onDisconnect() {
      socketRef.current?.emit("user-disconnect", { status: "Offline" });
    }

    if (!socketRef.current && session?.user) {
      const socket = initializeSocket(session.user.userId as string);
      socket.on("connect", () => {
        socketRef.current = socket;
      });
      socket.on("disconnect", onDisconnect);
    }
  }, [session?.user]);
  useEffect(() => {
    if (!socketRef.current) return;
    socketRef.current.on("get-message", (data: User) => {
      setAllMessages((messages: any) => [...messages, data]);
    });

    socketRef.current.once("display-status", (data) => {
      toast.message(`${data.name} is ${data.status}`, {
        position: "top-right",
      });
    });
    socketRef.current.on("display-during-typing", (data) => {
      console.log(data);
      setTypingUsers(data);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socketRef.current]);
  if (getAllMessage.isLoading) {
    return <h1>Loading</h1>;
  }
  const userData = {
    name: session?.user.name,
    email: session?.user.email,
    profilePic: session?.user.image,
    authId: session?.user.id,
    provider: session?.user.provider,
    status: "Online",
    _id: session?.user.userId,
  };
  return (
    <div className="h-full" onClick={() => setOpenEmoji(false)}>
      <div className="h-[440px] bg-[#3A3B3C] w-full rounded-md relative">
        <div className="w-full space-y-2 p-3 overflow-y-auto h-full">
          {allMessages.map((data: any) => (
            <div
              key={data._id}
              className={`flex space-x-2 w-full relative z-10  ${
                data.userId?._id === session?.user.userId
                  ? "justify-end"
                  : "justify-start"
              }`}
            >
              <div
                className={`w-1/2 flex ${
                  data.userId?._id === session?.user.userId
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
                  className={`flex items-end gap-1  ${
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
                      {data.userId?.name.split(" ")[0] ?? ""}
                    </small>
                    {/* ChatBox */}

                    <div
                      className={`p-2 rounded-md flex items-center justify-center break-words ${
                        data.userId?._id === session?.user.userId
                          ? "bg-[#6486FF]"
                          : "bg-[#171717]"
                      }`}
                    >
                      <span className="text-white">{data?.message}</span>
                    </div>
                  </div>
                  <div className="w-[32px] h-[32px] rounded-full relative px-4 py-2">
                    <Image
                      src={data.userId?.profilePic ?? themeImg}
                      alt="profile-pic"
                      fill
                      sizes="100%"
                      className="rounded-full absolute"
                      priority
                    />
                    <span
                      className={`w-2 h-2 ${
                        data.userId.status === "Online"
                          ? "bg-green-500"
                          : "bg-slate-500"
                      } rounded-full absolute right-[1px] bottom-[2px]`}
                    ></span>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {typingUsers.length !== 0 && (
            <div className="flex space-x-1 items-center">
              <div className="flex relative items-center">
                {typingUsers?.map((data, index) => (
                  <div key={index} className={`${index === 0 ? "" : "-m-1.5"}`}>
                    <div
                      className={
                        "w-[32px] h-[32px] rounded-full relative px-4 py-2"
                      }
                    >
                      <Image
                        src={data.userImg ?? themeImg}
                        alt="profile-picture"
                        fill
                        sizes="100%"
                        className="rounded-full absolute"
                        priority
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="absolute bottom-3 right-2 opacity-60">
          <Image
            src={themeImg}
            alt="chat-bot-img"
            width={200}
            height={200}
            priority
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
          onChange={(e) => {
            setMessage(e.target.value);
          }}
          onFocus={() => {
            socketRef.current?.emit("during-typing", {
              userImg: session?.user?.image,
              socketId: socketRef.current.id,
            });
          }}
          onBlur={() => {
            socketRef.current?.emit("stop-typing", {
              socketId: socketRef.current.id,
            });
          }}
          value={message}
          type="text"
          placeholder="Send a message"
          className="text-zinc-100 placeholder:text-zinc-300 py-3 rounded-md bg-[#3A3B3C] px-3 flex-grow"
        />
        {/* For Emoji */}
        <div className="relative">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setOpenEmoji((prev) => !prev);
            }}
            className={`px-4 flex  py-3.5 rounded-md items-center text-[#6486FF] text-xl ${
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
        {/* End For Emoji */}
        <button
          type="submit"
          disabled={!message.trim()}
          className="px-5 flex space-x-2 bg-[#6486FF] py-3 rounded-md items-center text-zinc-200 disabled:bg-slate-700 disabled:text-zinc-400"
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

export default PublicChat;
