"use client";
import axios, { AxiosError } from "axios";
import React, { useEffect, useRef, useState, useLayoutEffect } from "react";
import { useInfiniteQuery, useQueryClient, UseQueryResult } from "react-query";
import { useSession } from "next-auth/react";
import { serverUrl } from "@/utils/serverUrl";
import NewUser from "./NewUser";
import UserNotFound from "./UserNotFound";
import { Conversation, GetParticipantInfo, Messages } from "@/types/UserTypes";
import { useSocketStore } from "@/utils/store/socket.store";
import { nanoid } from "nanoid";
import LoadingChat from "@/components/LoadingChat";
import { useInView } from "react-intersection-observer";
import { usePathname } from "next/navigation";
import ChatHeader from "./ChatHeader";
import useGetParticipantInfo from "@/hooks/getParticipantInfo.hook";
import ChatBubbles from "@/components/ChatBubbles";
import MessageField from "@/components/MessageField";
function Chatboard({ conversationId }: { conversationId: string }) {
  const { socket } = useSocketStore();
  const pathname = usePathname();
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const currentPageRef = useRef(0);
  const scrollDivRef = useRef<HTMLDivElement | null>(null);
  const [message, setMessage] = useState<string>("");
  const [openEmoji, setOpenEmoji] = useState(false);
  const { data: session, status } = useSession();
  const [hasNextPage, setHasNextPage] = useState(true);
  const [allMessages, setAllMessages] = useState<Messages[]>([]);
  const { ref, inView } = useInView();
  const { participantInfo, isLoading: participantInfoLoading } =
    useGetParticipantInfo(conversationId, status, session);
  const { data, fetchNextPage, error, isLoading, isFetchingNextPage, isError } =
    useInfiniteQuery({
      queryKey: ["messages", conversationId],
      queryFn: async ({ pageParam = 0 }): Promise<any> => {
        const response = await axios.get(
          `${serverUrl}/api/messages/message-list/conversation/${conversationId}?page=${pageParam}&limit=${10}`
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
          scrollDivRef.current?.scrollTo(0, 30);
        }
      },
      refetchOnWindowFocus: false,
      enabled: status === "authenticated",
    });

  const getUserInfo = data?.pages[0]?.getUserInfo; //Lets retrieve the user's infos
  const queryClient = useQueryClient();
  useEffect(() => {
    return () => {
      queryClient.resetQueries(["messages", conversationId]); //To reset the cached data whenever the user unmount the components
    };
  }, [conversationId, queryClient]);
  useLayoutEffect(() => {
    if (!inView) {
      scrollRef.current?.scrollIntoView({ block: "end" });
    }
  }, [allMessages, pathname, inView, isFetchingNextPage]);
  useEffect(() => {
    if (inView && hasNextPage) {
      currentPageRef.current++;
      fetchNextPage();
    }
  }, [hasNextPage, fetchNextPage, inView]);
  useEffect(() => {
    if (!socket || status !== "authenticated") return;
    socket.emit("join-room", conversationId);
    socket.on("display-message", ({ getProfile, conversation }) => {
      setAllMessages((prevMessages) => [...prevMessages, getProfile]);
    });
    return () => {
      socket.off("display-message");
      socket.emit("leave-room", conversationId);
    };
  }, [conversationId, queryClient, socket, status]);
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
      return <UserNotFound />;
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
  }

  return (
    <div
      onClick={() => setOpenEmoji(false)}
      className="flex flex-grow w-full h-full flex-col"
    >
      <ChatHeader
        participantInfo={participantInfo}
        isLoading={participantInfoLoading}
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
                      participantId: participantInfo?.receiver_details._id,
                    });
                    sendMessage("👋");
                  }}
                  className="bg-[#414141] text-lg px-3 py-1.5 rounded-md overflow-hidden"
                >
                  <span className="mr-1">👋</span>
                </button>
              </div>
            ) : (
              <div
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
                    messageDetails={data}
                    session={session}
                  />
                ))}
                <div
                  className={`w-full justify-end items-end relative bottom-3 pr-1 ${
                    getUserInfo?.hasUnreadMessages?.user !==
                      session?.user.userId &&
                    getUserInfo?.hasUnreadMessages?.totalUnreadMessages === 0
                      ? "flex"
                      : "hidden"
                  } `}
                >
                  <small className="text-zinc-500">Seen</small>
                </div>
                <div ref={scrollRef} className="relative w-full"></div>
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
        setMessage={setMessage}
        setOpenEmoji={setOpenEmoji}
      />
    </div>
  );
}

export default Chatboard;
