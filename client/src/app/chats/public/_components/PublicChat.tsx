"use client";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { LuSend } from "react-icons/lu";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { Socket } from "socket.io-client";
import { useInfiniteQuery, useQueryClient } from "react-query";
import { serverUrl } from "@/utils/serverUrl";
import axios from "axios";
import { User } from "@/types/UserTypes";
import { initializePublicChatSocket } from "@/utils/socket";
import Image from "next/image";
import themeImg from "../../../../assets/images/theme-img.png";
import { MdEmojiEmotions } from "react-icons/md";
import Picker from "emoji-picker-react";
import typingChatAnimation from "../../../../assets/images/gif-animation/typing-chat-animation.gif";
import { IoIosArrowRoundDown } from "react-icons/io";
import { PublicMessages } from "@/types/UserTypes";
import { nanoid } from "nanoid";
import LoadingChat from "@/components/LoadingChat";
import { useInView } from "react-intersection-observer";
import { motion, AnimatePresence } from "framer-motion";
import PublicChatBubbles from "./ChatBubbles";
function PublicChat() {
  const [message, setMessage] = useState("");
  const { data: session, status } = useSession();
  const { ref, inView } = useInView();
  const [openEmoji, setOpenEmoji] = useState(false);
  const socketRef = useRef<Socket | null>();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const scrollDivRef = useRef<HTMLDivElement | null>(null);
  const scrollPositionRef = useRef(0);
  const currentPageRef = useRef(0);
  const [showArrowDown, setShowArrowDown] = useState(false);
  const [allMessages, setAllMessages] = useState<PublicMessages<User>[]>([]);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [typingUsers, setTypingUsers] = useState<
    { socketId: string; userImg: string }[]
  >([]);
  const { data, isError, fetchNextPage, isLoading } = useInfiniteQuery({
    queryKey: ["public-messages"],
    queryFn: async ({ pageParam = 0 }) => {
      const response = await axios.get(
        `${serverUrl}/api/messages/public?page=${pageParam}&limit=${20}`
      );
      return response.data.message;
    },
    refetchOnWindowFocus: false,
    getNextPageParam: (lastPage) => {
      if (lastPage.nextPage === null && hasNextPage) {
        setHasNextPage(false);
      }
      return lastPage.nextPage ?? false;
    },
    onSuccess: (data) => {
      const nextPage: PublicMessages<User>[] =
        data.pages[currentPageRef.current].getAllMessages;
      setAllMessages((prevMessages) => [...nextPage, ...prevMessages]);
      if (currentPageRef.current > 0 && scrollDivRef.current) {
        scrollDivRef.current.scrollTo(0, 80);
      }
    },
  });
  const queryClient = useQueryClient();
  useLayoutEffect(() => {
    if (currentPageRef.current <= 0) {
      scrollRef.current?.scrollIntoView({ block: "end" });
    }
  }, [allMessages]);
  useEffect(() => {
    return () => {
      queryClient.resetQueries(["public-messages"]); //Reset the cache
    };
  }, [queryClient]);
  useEffect(() => {
    if (inView && hasNextPage) {
      currentPageRef.current++;
      fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, inView]);
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
      setAllMessages((prevMessages: any) => [...prevMessages, data]);
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
      <div className="h-[440px] bg-[#222222] w-full rounded-md relative">
        {isLoading ? (
          <LoadingChat />
        ) : (
          <div
            onScroll={() => {
              if (scrollDivRef.current) {
                scrollPositionRef.current = scrollDivRef.current.scrollTop;
                const scrollHeight =
                  scrollDivRef.current.scrollHeight -
                  scrollDivRef.current.clientHeight;
                if (scrollHeight - scrollPositionRef.current > 300) {
                  setShowArrowDown(true);
                } else {
                  setShowArrowDown(false);
                }
              }
            }}
            ref={scrollDivRef}
            className="chat-div w-full space-y-2 p-3 overflow-y-auto h-full relative"
          >
            {hasNextPage && (
              <div ref={ref}>
                <LoadingChat />
              </div>
            )}
            {allMessages?.map((data: PublicMessages<User>) => (
              <PublicChatBubbles
                key={data._id}
                setMessage={setAllMessages}
                messageDetails={data}
                userData={session?.user as any}
              />
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
            <AnimatePresence mode="wait">
              {showArrowDown && (
                <motion.div
                  initial={{ opacity: 0, bottom: "10px" }}
                  animate={{ opacity: 1, bottom: "15px" }}
                  transition={{ duration: 0.25, ease: "easeIn" }}
                  exit={{ opacity: 0, bottom: "10px" }}
                  className=" flex items-center justify-center z-[999] sticky bg-transparent w-12 h-12 left-[50%] right-[50%]"
                >
                  <button
                    onClick={() => {
                      setShowArrowDown(false);
                      scrollRef.current?.scrollIntoView({
                        block: "end",
                        behavior: "smooth",
                      });
                    }}
                    className="w-10 h-10 rounded-full flex items-center justify-center p-1 bg-[#222222] text-[#6486FF]  text-2xl"
                  >
                    <IoIosArrowRoundDown />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
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
          if (status !== "authenticated") return;
          socketRef.current?.emit("send-message", message);
          const userData = {
            name: session?.user?.name,
            profilePic: session?.user.image,
            status: "Online",
            _id: session?.user.userId,
          };
          setAllMessages((prevMessages: PublicMessages<User>[]) => {
            return [
              ...prevMessages,
              {
                message,
                sender: userData,
                createdAt: new Date().toString(),
                isMessageDeleted: false,
                _id: nanoid(),
                reactions: [],
              },
            ];
          });
          setMessage("");
          setTimeout(() => {
            scrollRef.current?.scrollIntoView({ block: "end" }); //To bypass the closure nature of react :)
          }, 0);
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
