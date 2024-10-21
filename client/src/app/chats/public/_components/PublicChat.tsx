"use client";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { Socket } from "socket.io-client";
import { useInfiniteQuery, useQueryClient } from "react-query";
import { PUBLIC_SERVER_URL } from "@/utils/serverUrl";
import axios from "axios";
import { User, Reaction } from "@/types/UserTypes";
import { initializePublicChatSocket } from "@/utils/socket";
import Image from "next/image";
import themeImg from "../../../../assets/images/theme-img.png";
import typingChatAnimation from "../../../../assets/images/gif-animation/typing-chat-animation.gif";
import { IoIosArrowRoundDown } from "react-icons/io";
import { PublicMessages } from "@/types/UserTypes";
import { nanoid } from "nanoid";
import LoadingChat from "@/components/LoadingChat";
import { useInView } from "react-intersection-observer";
import { motion, AnimatePresence } from "framer-motion";
import PublicChatBubbles from "./ChatBubbles";
import PublicMessageField from "./PublicMessageField";
import PublicReactionList from "./PublicReactionList";
import typingAnimate from "../../../../assets/images/gif-animation/typing-animation-ver-2.gif";
function PublicChat() {
  const [message, setMessage] = useState("");
  const { data: session, status } = useSession();
  const { ref, inView } = useInView();
  const [openEmoji, setOpenEmoji] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const scrollDivRef = useRef<HTMLDivElement | null>(null);
  const scrollPositionRef = useRef(0);
  const currentPageRef = useRef(0);
  const [showArrowDown, setShowArrowDown] = useState(false);
  const [allMessages, setAllMessages] = useState<PublicMessages<User>[]>([]);
  const [openMessageIdReactionList, setOpenMessageIdReactionList] = useState<
    string | null
  >(null);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [typingUsers, setTypingUsers] = useState<
    { socketId: string; userImg: string }[]
  >([]);
  const { isError, fetchNextPage, isLoading } = useInfiniteQuery({
    queryKey: ["public-messages"],
    queryFn: async ({ pageParam = 0 }) => {
      const response = await axios.get(
        `${PUBLIC_SERVER_URL}/all/messages?page=${pageParam}&limit=${20}`
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
  }, [allMessages.length]);
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
      socket.emit("stop-typing"); //To ensure that the typing animation will be remove or cancel once the user refresh the page
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
    const handleDisplayReaction = ({
      isUserRemoveReaction,
      data,
    }: {
      isUserRemoveReaction: boolean;
      data: Reaction & { messageId: string };
    }) => {
      if (!isUserRemoveReaction) {
        setAllMessages((allMessages) => {
          return allMessages.map((messageDetails) => {
            if (messageDetails._id === data.messageId) {
              return {
                ...messageDetails,
                reactions: messageDetails.reactions.map((reaction) => {
                  if (reaction.reactor === data.reactor) {
                    return {
                      ...reaction,
                      reactionEmoji: data.reactionEmoji,
                      reactionCreatedAt: data.reactionCreatedAt,
                    };
                  } else {
                    return reaction;
                  }
                }),
              };
            } else {
              return messageDetails;
            }
          });
        });
      } else {
        setAllMessages((allMessages): any => {
          return allMessages.map((messageDetails) => {
            if (messageDetails._id === data.messageId) {
              return {
                ...messageDetails,
                reactions: messageDetails.reactions.filter((reaction) => {
                  return reaction.reactor !== data.reactor;
                }),
              };
            } else {
              return messageDetails;
            }
          });
        });
      }
    };
    socketRef.current.on("get-message", handleGetMessages);
    socketRef.current.on("display-reaction", handleDisplayReaction);
    socketRef.current.once("display-status", handleDisplayStatus);
    socketRef.current.on("display-during-typing", handleDisplayDuringTyping);
    return () => {
      socketRef.current?.off("get-message", handleGetMessages);
      socketRef.current?.off("display-reaction", handleDisplayReaction);
      socketRef.current?.off("display-status", handleDisplayStatus);
      socketRef.current?.off(
        "display-during-typing",
        handleDisplayDuringTyping
      );
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socketRef.current]);
  function sendMessage() {
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
    socketRef.current?.emit("stop-typing");
  }
  return (
    <div className="h-full relative" onClick={() => setOpenEmoji(false)}>
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
                key={data?._id}
                socket={socketRef.current as Socket}
                setMessage={setAllMessages}
                messageDetails={data}
                userData={session?.user as User | undefined}
                setOpenMessageIdReactionList={setOpenMessageIdReactionList}
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
                          src={data.userImg}
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
                      src={typingAnimate}
                      alt="typing-animation"
                      width={35}
                      height={35}
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
                    className="w-10 h-10 rounded-full flex items-center justify-center p-1 bg-[#414141] text-[#6486FF] text-2xl"
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
      <PublicMessageField
        openEmoji={openEmoji}
        message={message}
        sendMessage={sendMessage}
        sessionData={session?.user}
        scrollRef={scrollRef.current}
        socketRef={socketRef?.current}
        inputRef={inputRef}
        setMessage={setMessage}
        setOpenEmoji={setOpenEmoji}
      />
      {openMessageIdReactionList && (
        <PublicReactionList
          messageId={openMessageIdReactionList}
          setOpenMessageIdReactionList={setOpenMessageIdReactionList}
          userId={session?.user.userId as string}
        />
      )}
    </div>
  );
}

export default PublicChat;
