"use client";
import axios, { AxiosError } from "axios";
import React, {
  useEffect,
  useRef,
  useState,
  useLayoutEffect,
  ReactNode,
  Dispatch,
  SetStateAction,
} from "react";
import { useInfiniteQuery, useQueryClient } from "react-query";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { PRIVATE_SERVER_URL } from "@/utils/serverUrl";
import NewUser from "./NewUser";
import UserNotFound from "./UserNotFound";
import { Message, Reaction, User } from "@/types/shared.types";
import { useSocketStore } from "@/utils/store/socket.store";
import LoadingChat from "@/components/LoadingChat";
import { useInView } from "react-intersection-observer";
import ChatHeader from "./ChatHeader";
import PrivateChatBubbles from "./PrivateChatBubbles";
import { AnimatePresence } from "framer-motion";
import ProfileCard from "../../../_components/ProfileCard";
import typingAnimation from "../../../../../../assets/images/gif-animation/typing-animation-ver-2.gif";
import SendAttachment from "@/components/SendAttachment";
import useParticipantInfo from "@/hooks/useParticipantInfo.hook";
import PrivateMessageField from "./PrivateMessageField";
import {
  handleNotificationDecrement,
  handleUnreadMessageSign,
  optimisticUpdateMessage,
  updateConversationList,
} from "@/utils/sharedUpdateFunction";
import { handleSeenUpdate } from "@/utils/sharedUpdateFunction";
import BackToBottomArrow from "../../../_components/BackToBottomArrow";
import { Session } from "next-auth";
import { GetParticipantInfo } from "@/types/user.types";
import SystemTimeChatBubbles from "../../../_components/SystemTimeChatBubbles";
import SystemChatBubbles from "../../../_components/SystemChatBubbles";
function ParentDiv({
  children,
  setOpenEmoji,
}: {
  children: ReactNode;
  setOpenEmoji: Dispatch<SetStateAction<boolean>>;
}) {
  return (
    <div
      className="flex w-full h-full flex-col relative"
      onClick={() => {
        setOpenEmoji(false);
      }}
    >
      {children}
    </div>
  );
}

function Chatboard({ conversationId }: { conversationId: string }) {
  const { privateSocket, statusSocket } = useSocketStore();
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const currentPageRef = useRef(0);
  const scrollDivRef = useRef<HTMLDivElement | null>(null);
  const scrollPositionRef = useRef<number>(0);
  const [openProfileModal, setOpenProfileModal] = useState(false);
  const [message, setMessage] = useState<string>("");
  const [openEmoji, setOpenEmoji] = useState(false);
  const { data: session, status } = useSession();
  const [hasNextPage, setHasNextPage] = useState(true);
  const [allMessages, setAllMessages] = useState<Message<User>[]>([]);
  const [showArrowDown, setShowArrowDown] = useState(false);
  const [openAttachmentModal, setOpenAttachmentModal] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const { ref, inView } = useInView();

  const { participantInfo, isLoading: participantInfoLoading } =
    useParticipantInfo(conversationId);
  const { data, fetchNextPage, error, isLoading, isError } = useInfiniteQuery({
    queryKey: ["private-messages", conversationId],
    queryFn: async ({ pageParam = 0 }): Promise<any> => {
      const response = await axios.get(
        `${PRIVATE_SERVER_URL}/message/list/${conversationId}?page=${pageParam}&limit=${20}`
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
      queryClient.resetQueries(["private-messages", conversationId]); //To reset the cached data whenever the user unmount the component
    };
  }, [conversationId, queryClient]);

  useLayoutEffect(() => {
    if (!scrollRef.current) return;
    if (currentPageRef.current <= 0) {
      scrollRef.current.scrollIntoView({ block: "end" });
    }
  }, [allMessages.length]);

  useEffect(() => {
    if (inView && hasNextPage) {
      currentPageRef.current++;
      fetchNextPage();
    }
  }, [hasNextPage, fetchNextPage, inView]);

  useEffect(() => {
    if (
      !privateSocket ||
      status !== "authenticated" ||
      !participantInfo?.receiver_details._id
    )
      return;
    handleNotificationDecrement(
      queryClient,
      "totalUnreadPrivateConversation",
      conversationId
    );
    privateSocket.emit("read-message", {
      conversationId,
      participantId: participantInfo.receiver_details._id,
    });
  }, [
    conversationId,
    participantInfo?.receiver_details._id,
    queryClient,
    privateSocket,
    status,
  ]);
  useEffect(() => {
    if (statusSocket) {
      statusSocket.on(
        "display-user-status",
        ({ userId, status: { type, lastActiveAt } }) => {
          setAllMessages((allMessage) => {
            return allMessage.map((message) => {
              if (message.sender._id === userId) {
                return {
                  ...message,
                  sender: {
                    ...message.sender,
                    status: {
                      type,
                      lastActiveAt,
                    },
                  },
                };
              } else {
                return message;
              }
            });
          });

          queryClient.setQueryData<GetParticipantInfo | undefined>(
            ["participant-info", conversationId],
            (cachedData) => {
              if (cachedData) {
                return {
                  ...cachedData,
                  receiver_details: {
                    ...cachedData.receiver_details,
                    status: {
                      type,
                      lastActiveAt,
                    },
                  },
                };
              }
            }
          );
        }
      );
    }
    return () => {
      statusSocket?.off("display-user-status");
    };
  }, [conversationId, queryClient, statusSocket]);
  useEffect(() => {
    if (!privateSocket) return;
    privateSocket.on("display-seen-user", ({ display_seen }) => {
      handleSeenUpdate(
        queryClient,
        ["participant-info", conversationId],
        display_seen
      );
    });
    privateSocket.on("display-message", ({ getProfile }) => {
      setAllMessages((prevMessages) => [...prevMessages, getProfile]);
    });
    privateSocket.on("during-typing", (conversationId) => {
      setTypingUsers((prevUsers) => [...prevUsers, conversationId]);
    });
    privateSocket.on("stop-typing", (conversationId) => {
      setTypingUsers((prevUsers) =>
        prevUsers.filter((user) => user !== conversationId)
      );
    });
    handleUnreadMessageSign(queryClient, conversationId, true);
    return () => {
      privateSocket.off("display-seen-text");
      privateSocket.off("display-message");
      privateSocket.off("during-typing");
      privateSocket.off("stop-typing");
    };
  }, [conversationId, queryClient, privateSocket, session?.user.userId]);

  if (conversationId.toLowerCase() === "new") {
    return <NewUser />;
  }
  if (isError) {
    const errorMessage = error as AxiosError<{ message: string }>;
    if (errorMessage.response?.status === 404) {
      return <UserNotFound errorMessage={errorMessage.response.data.message} />;
    }
  }

  return (
    <ParentDiv setOpenEmoji={setOpenEmoji}>
      <div className="flex-grow flex flex-col w-full background-div">
        <ChatHeader
          participantInfo={participantInfo?.receiver_details}
          isLoading={participantInfoLoading}
          setOpenProfileModal={setOpenProfileModal}
        />
        {isLoading || !data ? (
          <LoadingChat />
        ) : (
          <div className="h-full w-full relative">
            {allMessages.length === 0 ? (
              <div className=" flex items-center flex-col justify-end h-full w-full pb-5 space-y-2">
                <h3 className="text-zinc-300 text-[0.78rem]">
                  Wave to {participantInfo?.receiver_details.name}
                </h3>
                <button
                  onClick={() => {
                    privateSocket?.emit("send-message", {
                      message: "👋",
                      messageType: "text",
                      conversationId,
                      participantId: participantInfo?.receiver_details._id,
                    });
                    updateConversationList(
                      queryClient,
                      "👋",
                      conversationId,
                      session?.user.userId,
                      "text",
                      "chat-list",
                      true,
                      new Date(),
                      { _id: session?.user.userId as string }
                    );
                    optimisticUpdateMessage(
                      "👋",
                      setAllMessages as Dispatch<
                        SetStateAction<Message<User, Reaction[] | string>[]>
                      >,
                      session,
                      ""
                    );
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
                className="w-full max-h-[460px] overflow-y-auto flex flex-col space-y-3 relative px-3"
              >
                {hasNextPage && (
                  <div ref={ref} className="w-full z-50">
                    <LoadingChat />
                  </div>
                )}
                {allMessages?.map((data: Message<User>) =>
                  data.type === "text" ? (
                    <PrivateChatBubbles
                      key={data._id}
                      messageDetails={data}
                      session={session}
                      conversationId={conversationId}
                      setMessage={setAllMessages}
                    />
                  ) : data.type === "time" ? (
                    <SystemTimeChatBubbles
                      message={data.message}
                      key={data._id}
                    />
                  ) : (
                    <SystemChatBubbles
                      senderName={data.sender.name}
                      senderId={data.sender._id}
                      userId={session?.user.userId as string}
                      message={data.message}
                    />
                  )
                )}
                {typingUsers.find((user) => user === conversationId) ? (
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
                <div
                  className={`w-full justify-end items-end relative bottom-3 pr-1 pt-1.5 ${
                    participantInfo?.is_user_already_seen_message
                      ? "flex"
                      : "hidden"
                  } `}
                >
                  <Image
                    src={participantInfo?.receiver_details.profilePic ?? ""}
                    width={15}
                    height={15}
                    className="rounded-full"
                    alt="Profile Image"
                    priority
                  />
                </div>
                <div ref={scrollRef} className="relative w-full"></div>
                <AnimatePresence mode="wait">
                  {showArrowDown && (
                    <BackToBottomArrow
                      setShowArrowDown={setShowArrowDown}
                      scrollRef={scrollRef.current}
                    />
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        )}
      </div>
      <PrivateMessageField
        privateSocket={privateSocket}
        conversationId={conversationId}
        participantId={participantInfo?.receiver_details._id}
        message={message}
        openEmoji={openEmoji}
        senderId={session?.user.userId}
        scrollRef={scrollRef.current}
        session={session as Session}
        setAllMessages={
          setAllMessages as Dispatch<
            SetStateAction<Message<User, Reaction[] | string>[]>
          >
        }
        setMessage={setMessage}
        setOpenEmoji={setOpenEmoji}
        setOpenAttachmentModal={setOpenAttachmentModal}
      />
      {openProfileModal && (
        <ProfileCard
          conversationId={conversationId}
          setOpenProfileModal={setOpenProfileModal}
          participantId={participantInfo?.receiver_details._id as string}
        />
      )}
      {openAttachmentModal && (
        <SendAttachment setOpenAttachmentModal={setOpenAttachmentModal} />
      )}
    </ParentDiv>
  );
}

export default Chatboard;
