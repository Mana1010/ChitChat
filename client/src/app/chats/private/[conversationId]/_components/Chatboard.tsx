"use client";
import axios, { AxiosError } from "axios";
import React, { useEffect, useRef, useState, useLayoutEffect } from "react";
import { useInfiniteQuery, useQueryClient } from "react-query";
import { useSession } from "next-auth/react";
import { serverUrl } from "@/utils/serverUrl";
import NewUser from "./NewUser";
import UserNotFound from "./UserNotFound";
import {
  Conversation,
  FullInfoUser,
  GetParticipantInfo,
  Messages,
} from "@/types/UserTypes";
import { useSocketStore } from "@/utils/store/socket.store";
import { nanoid } from "nanoid";
import LoadingChat from "@/components/LoadingChat";
import { useInView } from "react-intersection-observer";
import ChatHeader from "./ChatHeader";
import useGetParticipantInfo from "@/hooks/getParticipantInfo.hook";
import ChatBubbles from "@/app/chats/private/[conversationId]/_components/ChatBubbles";
import MessageField from "@/components/MessageField";
import { IoIosArrowRoundDown } from "react-icons/io";
import { AnimatePresence, motion } from "framer-motion";
import ProfileCard from "@/app/chats/_components/ProfileCard";
function Chatboard({ conversationId }: { conversationId: string }) {
  const { socket } = useSocketStore();
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const currentPageRef = useRef(0);
  const scrollDivRef = useRef<HTMLDivElement | null>(null);
  const scrollPositionRef = useRef<number>(0);
  const [openProfileModal, setOpenProfileModal] = useState(false);
  const [message, setMessage] = useState<string>("");
  const [openEmoji, setOpenEmoji] = useState(false);
  const { data: session, status } = useSession();
  const [hasNextPage, setHasNextPage] = useState(true);
  const [allMessages, setAllMessages] = useState<Messages[]>([]);
  const [showArrowDown, setShowArrowDown] = useState(false);
  const { ref, inView } = useInView();
  const { participantInfo, isLoading: participantInfoLoading } =
    useGetParticipantInfo(conversationId, status, session);
  const { data, fetchNextPage, error, isLoading, isError } = useInfiniteQuery({
    queryKey: ["messages", conversationId],
    queryFn: async ({ pageParam = 0 }): Promise<any> => {
      const response = await axios.get(
        `${serverUrl}/api/messages/message-list/conversation/${conversationId}?page=${pageParam}&limit=${20}`
      );

      return response.data.message;
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.nextPage === null && hasNextPage) {
        setHasNextPage(false);
      }
      return lastPage?.nextPage ?? null;
    },
    onSuccess: (data) => {
      console.log(data);
      setAllMessages((prevMessages) => [
        ...data.pages[currentPageRef.current]?.getMessages,
        ...prevMessages,
      ]);

      if (currentPageRef.current > 0 && scrollDivRef.current) {
        scrollDivRef.current.scrollTo(0, 40);
      }
    },
    refetchOnWindowFocus: false,
    enabled: status === "authenticated",
  });
  const queryClient = useQueryClient();
  useEffect(() => {
    return () => {
      queryClient.resetQueries(["messages", conversationId]); //To reset the cached data whenever the user unmount the component
    };
  }, [conversationId, queryClient]);
  useLayoutEffect(() => {
    if (!scrollRef.current) return;
    if (currentPageRef.current <= 0) {
      scrollRef.current.scrollIntoView({ block: "end" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    scrollRef.current,
    allMessages.length,
    currentPageRef.current,
    participantInfo,
  ]);
  useEffect(() => {
    if (inView && hasNextPage) {
      currentPageRef.current++;
      fetchNextPage();
    }
  }, [hasNextPage, fetchNextPage, inView]);
  useEffect(() => {
    if (
      !socket ||
      status !== "authenticated" ||
      !participantInfo?.receiver_details._id
    )
      return;
    const participantID = participantInfo.receiver_details._id ?? "";
    socket.emit("join-room", conversationId);

    socket.on("display-message", ({ getProfile, conversation }) => {
      setAllMessages((prevMessages) => [...prevMessages, getProfile]);
    });
    return () => {
      socket.off("display-message");
      socket.emit("leave-room", conversationId);
      socket.emit(
        "leave-receiverId-room",
        participantInfo.receiver_details._id
      );
    };
  }, [
    conversationId,
    participantInfo?.receiver_details._id,
    queryClient,
    socket,
    status,
  ]);
  socket?.emit("join-receiverId-room", participantInfo?.receiver_details?._id);
  useEffect(() => {
    if (!socket) return;
    socket.on("display-seen-text", ({ user, totalUnreadMessages }) => {
      queryClient.setQueryData<GetParticipantInfo | undefined>(
        ["participant-info", conversationId],
        (cachedData: GetParticipantInfo | undefined) => {
          if (cachedData) {
            return {
              ...cachedData,
              hasUnreadMessages: {
                user,
                totalUnreadMessages,
              },
            };
          }
        }
      );
    });
    return () => {
      socket.off("display-seen-text");
    };
  }, [conversationId, queryClient, socket]);

  useEffect(() => {
    if (!socket) return;
    socket.emit("read-message", {
      conversationId,
      participantId: participantInfo?.receiver_details?._id,
    });
  }, [
    conversationId,
    participantInfo?.receiver_details._id,
    socket,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    data?.pages[0]?.getMessages,
  ]);
  if (conversationId.toLowerCase() === "new") {
    return <NewUser />;
  }
  if (isError) {
    const errorMessage = error as AxiosError<{ message: string }>;
    if (errorMessage.response?.status === 404) {
      console.log(errorMessage.response.data.message);
      return <UserNotFound errorMessage={errorMessage.response.data.message} />;
    }
  }
  function sendMessage(messageContent: string) {
    queryClient.setQueryData<GetParticipantInfo | undefined>(
      ["participant-info", conversationId],
      (cachedData: GetParticipantInfo | undefined) => {
        if (cachedData) {
          return {
            ...cachedData,
            hasUnreadMessages: {
              ...cachedData.hasUnreadMessages,
              totalUnreadMessages:
                cachedData.hasUnreadMessages.totalUnreadMessages + 1,
            },
          };
        }
      }
    );
    setAllMessages((prevMessages: Messages[]): any => {
      return [
        ...prevMessages,
        {
          message: messageContent,
          sender: {
            name: session?.user.name.split(" ")[0],
            status: "Online",
            profilePic: session?.user.image,
            _id: session?.user.userId,
          },
          isRead: false,
          _id: nanoid(), //As temporary data
        },
      ];
    });
    setTimeout(() => {
      scrollRef.current?.scrollIntoView({ block: "end" }); //To bypass the closure nature of react :)
    }, 0);
  }
  function updateChatList(userMessage: string) {
    queryClient.setQueryData<Conversation[] | undefined>(
      ["chat-list"],
      (cachedData: any) => {
        if (cachedData) {
          return cachedData
            .map((chatlist: Conversation) => {
              if (chatlist._id === conversationId) {
                return {
                  ...chatlist,
                  lastMessage: {
                    sender: session?.user.userId,
                    text: userMessage,
                    lastMessageCreatedAt: new Date(),
                  },
                };
              } else {
                return chatlist;
              }
            })
            .sort(
              (a: Conversation, b: Conversation) =>
                new Date(b.lastMessage.lastMessageCreatedAt).getTime() -
                new Date(a.lastMessage.lastMessageCreatedAt).getTime()
            );
        }
      }
    );
  }
  return (
    <div
      onClick={() => setOpenEmoji(false)}
      className="flex flex-grow w-full h-full flex-col relative"
    >
      <ChatHeader
        participantInfo={participantInfo?.receiver_details}
        isLoading={participantInfoLoading}
        setOpenProfileModal={setOpenProfileModal}
      />
      <div className="flex-grow w-full p-3">
        {isLoading || !data ? (
          <LoadingChat />
        ) : (
          <div className="h-full w-full relative">
            {allMessages.length === 0 ? (
              <div className="flex items-center flex-col justify-end h-full w-full pb-5 space-y-2">
                <h3 className="text-zinc-300 text-[0.78rem]">
                  Wave to {participantInfo?.receiver_details.name}
                </h3>
                <button
                  onClick={() => {
                    socket?.emit("send-message", {
                      message: "👋",
                      conversationId,
                      receiverId: participantInfo?.receiver_details._id,
                    });
                    sendMessage("👋");
                    updateChatList("👋");
                  }}
                  className="bg-[#414141] text-lg px-3 py-1.5 rounded-md overflow-hidden"
                >
                  <span className="mr-1">👋</span>
                </button>
              </div>
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
                className="w-full max-h-[430px] overflow-y-auto flex flex-col space-y-3 relative pr-2"
              >
                {hasNextPage && (
                  <div ref={ref} className="w-full z-50">
                    <LoadingChat />
                  </div>
                )}
                {allMessages?.map((data: Messages) => (
                  <ChatBubbles
                    key={data._id}
                    participantId={
                      participantInfo?.receiver_details._id as string
                    }
                    messageDetails={data}
                    session={session}
                    conversationId={conversationId}
                    setMessage={setAllMessages}
                  />
                ))}
                <div
                  className={`w-full justify-end items-end relative bottom-3 pr-1 ${
                    participantInfo?.hasUnreadMessages?.user !==
                      session?.user.userId &&
                    participantInfo?.hasUnreadMessages?.totalUnreadMessages ===
                      0
                      ? "flex"
                      : "hidden"
                  } `}
                >
                  <small className="text-zinc-500">Seen</small>
                </div>
                <div ref={scrollRef} className="relative w-full"></div>
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
                        className="w-10 h-10 rounded-full flex items-center justify-center p-1 bg-[#414141] text-[#6486FF]  text-2xl"
                      >
                        <IoIosArrowRoundDown />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        )}
      </div>
      <MessageField
        socket={socket}
        participantInfo={participantInfo}
        conversationId={conversationId}
        message={message}
        openEmoji={openEmoji}
        sendMessage={sendMessage}
        updateChatList={updateChatList}
        setMessage={setMessage}
        setOpenEmoji={setOpenEmoji}
      />
      {openProfileModal && (
        <ProfileCard
          conversationId={conversationId}
          setOpenProfileModal={setOpenProfileModal}
        />
      )}
    </div>
  );
}

export default Chatboard;
