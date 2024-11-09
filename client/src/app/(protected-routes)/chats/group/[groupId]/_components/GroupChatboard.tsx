"use client";
import axios, { AxiosError } from "axios";
import React, { useEffect, useRef, useState, useLayoutEffect } from "react";
import { useInfiniteQuery, useQueryClient } from "react-query";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { GROUP_SERVER_URL } from "@/utils/serverUrl";
import NoGroup from "./NoGroup";
import UserNotFound from "./UserNotFound";
import { Conversation, GetParticipantInfo } from "@/types/UserTypes";
import { Message } from "@/types/shared.types";
import { useSocketStore } from "@/utils/store/socket.store";
import { nanoid } from "nanoid";
import LoadingChat from "@/components/LoadingChat";
import { useInView } from "react-intersection-observer";
import ChatHeader from "./ChatHeader";
import ChatBubbles from "./ChatBubbles";
import { IoIosArrowRoundDown } from "react-icons/io";
import { AnimatePresence, motion } from "framer-motion";
import ProfileCard from "../../../_components/ProfileCard";
import typingAnimation from "../../../../../../assets/images/gif-animation/typing-animation-ver-2.gif";
import SendAttachment from "@/components/SendAttachment";
import useGroupInfo from "@/hooks/useGroupInfo.hook";
import { User } from "@/types/shared.types";
import MessageField from "./MessageField";
function GroupChatboard({ groupId }: { groupId: string }) {
  const { socket, groupMessageSocket } = useSocketStore();
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const currentPageRef = useRef(0);
  const scrollDivRef = useRef<HTMLDivElement | null>(null);
  const scrollPositionRef = useRef<number>(0);
  const [openProfileModal, setOpenProfileModal] = useState(false);
  const [message, setMessage] = useState<string>("");
  const [openEmoji, setOpenEmoji] = useState(false);
  const { data: session, status } = useSession();
  const [hasNextPage, setHasNextPage] = useState(true);
  const [allMessages, setAllMessages] = useState<Message<User, string[]>[]>([]);
  const [showArrowDown, setShowArrowDown] = useState(false);
  const [openAttachmentModal, setOpenAttachmentModal] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const { ref, inView } = useInView();

  const { groupInfo, isLoading: groupInfoLoading } = useGroupInfo(
    groupId,
    status
  );
  const { data, fetchNextPage, error, isLoading, isError } = useInfiniteQuery({
    queryKey: ["group-messages", groupId],
    queryFn: async ({ pageParam = 0 }): Promise<any> => {
      const response = await axios.get(
        `${GROUP_SERVER_URL}/message/list/${groupId}?page=${pageParam}&limit=${20}`
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
      queryClient.resetQueries(["group-messages", groupId]); //To reset the cached data whenever the user unmount the component
    };
  }, [groupId, queryClient]);
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
    groupInfo,
  ]);

  useEffect(() => {
    if (inView && hasNextPage) {
      currentPageRef.current++;
      fetchNextPage();
    }
  }, [hasNextPage, fetchNextPage, inView]);

  useEffect(() => {
    if (!socket || status !== "authenticated" || !groupInfo?._id) return;
    socket.emit("join-room", groupId);
    socket.emit("read-message", {
      groupId,
      participantId: groupInfo._id,
    });
    return () => {
      socket.emit("leave-room", groupId);
    };
  }, [groupId, groupInfo?._id, queryClient, socket, status]);

  useEffect(() => {
    if (!socket) return;
    socket.on("display-seen-text", ({ user, totalUnreadMessages }) => {
      queryClient.setQueryData<GetParticipantInfo | undefined>(
        ["participant-info", groupId],
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

    socket.on("display-message", ({ getProfile }) => {
      setAllMessages((prevMessages) => [...prevMessages, getProfile]);
    });

    socket.on("during-typing", (conversationId) => {
      setTypingUsers((prevUsers) => [...prevUsers, conversationId]);
    });
    socket.on("stop-typing", (conversationId) => {
      setTypingUsers((prevUsers) =>
        prevUsers.filter((user) => user !== conversationId)
      );
    });
    return () => {
      socket.off("display-seen-text");
      socket.off("display-message");
      socket.off("during-typing");
      socket.off("stop-typing");
    };
  }, [groupId, queryClient, socket]);

  if (groupId.toLowerCase() === "new") {
    return <NoGroup />;
  }
  if (isError) {
    const errorMessage = error as AxiosError<{ message: string }>;
    if (errorMessage.response?.status === 404) {
      return <UserNotFound errorMessage={errorMessage.response.data.message} />;
    }
  }
  function sendMessage(messageContent: string) {
    setAllMessages((prevMessages: any) => {
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
          type: "text",
          isRead: false,
          _id: nanoid(), //As temporary data
        },
      ];
    });
    socket?.emit("stop-typing", groupId);
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
              if (chatlist._id === groupId) {
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
      onClick={() => {
        setOpenEmoji(false);
        // setOpenAttachmentModal(false);
      }}
      className="flex flex-grow w-full h-full flex-col relative"
    >
      <ChatHeader
        groupInfo={groupInfo as any}
        isLoading={groupInfoLoading}
        setOpenProfileModal={setOpenProfileModal}
      />
      <div className="flex-grow w-full p-3">
        {isLoading || !data ? (
          <LoadingChat />
        ) : (
          <div className="h-full w-full relative">
            {allMessages.length === 0 ? (
              <div className="flex items-center flex-col justify-end h-full w-full pb-5 space-y-2">
                <h3 className="text-zinc-300 text-[0.78rem]">Wave them</h3>
                <button
                  onClick={() => {
                    socket?.emit("send-message", {
                      message: "👋",
                      groupId,
                      receiverId: groupInfo?.receiver_details._id,
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
                {allMessages?.map((data: Message<User, string[]>) =>
                  data.type === "text" ? (
                    <ChatBubbles
                      key={data._id}
                      messageDetails={data}
                      session={session}
                      groupId={groupId}
                      setMessage={setAllMessages}
                    />
                  ) : (
                    <div
                      key={data._id}
                      className="w-full flex items-center justify-center"
                    >
                      <h1 className="text-zinc-500 text-sm">
                        {`${data.sender.name} ${data.message}`}
                      </h1>
                    </div>
                  )
                )}
                {typingUsers.find((user) => user === groupId) ? (
                  <div className="flex space-x-1 items-center">
                    <div className="rounded-3xl bg-[#414141] py-1 px-2 ">
                      <Image
                        src={typingAnimation}
                        alt="typing-animation"
                        width={35}
                        height={35}
                        priority
                      />
                    </div>
                  </div>
                ) : null}
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
        socket={groupMessageSocket}
        groupId={groupId}
        message={message}
        openEmoji={openEmoji}
        sendMessage={sendMessage}
        updateChatList={updateChatList}
        setMessage={setMessage}
        setOpenEmoji={setOpenEmoji}
        setOpenAttachmentModal={setOpenAttachmentModal}
      />
      {/* {openProfileModal && (
        <ProfileCard
          conversationId={groupId}
          setOpenProfileModal={setOpenProfileModal}
        />
      )} */}
      {openAttachmentModal && (
        <SendAttachment setOpenAttachmentModal={setOpenAttachmentModal} />
      )}
    </div>
  );
}

export default GroupChatboard;
