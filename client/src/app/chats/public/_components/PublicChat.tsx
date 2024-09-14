"use client";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { LuSend } from "react-icons/lu";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { Socket } from "socket.io-client";
import { useQuery, useQueryClient, UseQueryResult } from "react-query";
import { serverUrl } from "@/utils/serverUrl";
import axios, { AxiosError } from "axios";
import { User } from "@/types/next-auth";
import { initializePublicChatSocket } from "@/utils/socket";
import Image from "next/image";
import themeImg from "../../../../assets/images/theme-img.png";
import { MdEmojiEmotions } from "react-icons/md";
import Picker from "emoji-picker-react";
import typingChatAnimation from "../../../../assets/images/gif-animation/typing-chat-animation.gif";
import chatLoadingAnimation from "../../../../assets/images/gif-animation/chat-loading.gif";
import { PublicMessages } from "@/types/UserTypes";
import { nanoid } from "nanoid";
import LoadingChat from "@/components/LoadingChat";
function PublicChat() {
  const [message, setMessage] = useState("");
  const { data: session } = useSession();
  const [openEmoji, setOpenEmoji] = useState(false);
  const socketRef = useRef<Socket | null>();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [typingUsers, setTypingUsers] = useState<
    { socketId: string; userImg: string }[]
  >([]);
  const getAllMessage: UseQueryResult<
    PublicMessages[],
    AxiosError<{ message: string }>
  > = useQuery({
    queryKey: ["public-messages"],
    queryFn: async () => {
      const response = await axios.get(`${serverUrl}/api/messages/public`);
      return response.data.message;
    },
  });
  const queryClient = useQueryClient();
  useLayoutEffect(() => {
    scrollRef.current?.scrollIntoView({ block: "end" });
  }, [getAllMessage.data, typingUsers]);
  useEffect(() => {
    function onDisconnect() {
      socketRef.current?.emit("user-disconnect", { status: "Offline" });
    }

    if (!socketRef.current && session?.user) {
      const socket = initializePublicChatSocket(session.user.userId as string);
      socketRef.current = socket;
      socket.on("connect", () => console.log("Connected Successfully"));
      socket.on("disconnect", onDisconnect);
    }
  }, [session?.user]);
  useEffect(() => {
    if (!socketRef.current) return;
    const handleGetMessages = (data: User) => {
      queryClient.setQueryData<PublicMessages[] | undefined>(
        ["public-messages"],
        (prevMessages): any => {
          if (prevMessages) {
            return [...prevMessages, data];
          } else {
            return [data];
          }
        }
      );
    };
    const handleDisplayStatus = (data: { name: string; status: string }) => {
      toast.message(`${data.name} is ${data.status}`, {
        position: "top-right",
      });
    };
    const handleDisplayDuringTyping = (
      data: {
        socketId: string;
        userImg: string;
      }[]
    ) => {
      setTypingUsers(data);
    };
    socketRef.current.on("get-message", handleGetMessages);
    socketRef.current.once("display-status", handleDisplayStatus);
    socketRef.current.on("display-during-typing", handleDisplayDuringTyping);
    return () => {
      socketRef.current?.off("get-message", handleGetMessages);
      socketRef.current?.off("display-status", handleDisplayStatus);
      socketRef.current?.off(
        "display-during-typing",
        handleDisplayDuringTyping
      );
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socketRef.current]);
  return (
    <div className="h-full" onClick={() => setOpenEmoji(false)}>
      <div className="h-[440px] bg-[#3A3B3C] w-full rounded-md relative">
        {getAllMessage.isLoading ? (
          <LoadingChat />
        ) : (
          <div className="chat-div w-full space-y-2 p-3 overflow-y-auto h-full relative">
            {getAllMessage.data?.map((data: PublicMessages) => (
              <div
                key={data._id}
                className={`flex space-x-2 w-full relative z-10 ${
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
                          data.userId?._id === session?.user.userId &&
                          "text-end"
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
                    <div
                      key={index}
                      className={`${index === 0 ? "" : "-m-1.5"}`}
                    >
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
                  <div className="pl-2 pt-2">
                    <Image
                      src={typingChatAnimation}
                      alt="typing-animation"
                      width={25}
                      height={25}
                      priority
                    />
                  </div>
                </div>
              </div>
            )}
            <div ref={scrollRef} className="relative top-5"></div>
          </div>
        )}

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
          queryClient.setQueryData<PublicMessages[] | undefined>(
            ["public-messages"],
            (prevMessages): PublicMessages[] => {
              const userData = {
                name: session?.user?.name,
                profilePic: session?.user.image,
                status: "Online",
                _id: session?.user.userId,
              };
              if (prevMessages && session?.user) {
                return [
                  ...prevMessages,
                  {
                    message,
                    userId: userData,
                    createdAt: new Date().toString(),
                    isMessageDeleted: false,
                    _id: nanoid(),
                  },
                ];
              } else {
                return [
                  {
                    message,
                    userId: userData,
                    createdAt: new Date().toString(),
                    isMessageDeleted: false,
                    _id: nanoid(),
                  },
                ];
              }
            }
          );
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
          ref={inputRef}
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
