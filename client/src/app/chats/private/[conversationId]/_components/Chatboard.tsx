"use client";
import axios from "axios";
import React, {
  useEffect,
  useRef,
  useState,
  useLayoutEffect,
  useMemo,
} from "react";
import {
  InfiniteData,
  useInfiniteQuery,
  useQuery,
  useQueryClient,
  UseQueryResult,
} from "react-query";
import { useSession } from "next-auth/react";
import { serverUrl } from "@/utils/serverUrl";
import Image from "next/image";
import { HiOutlineDotsCircleHorizontal } from "react-icons/hi";
import NewUser from "./NewUser";
import UserNotFound from "./UserNotFound";
import emptyChat from "../../../../../assets/images/empty-chat.png";
import Picker from "emoji-picker-react";
import { MdEmojiEmotions } from "react-icons/md";
import { LuSend } from "react-icons/lu";
import { ConversationAndMessagesSchema, Messages } from "@/types/UserTypes";
import { useSocketStore } from "@/utils/store/socket.store";
import { nanoid } from "nanoid";
import ChatBoardHeaderSkeleton from "@/app/chats/_components/ChatBoardHeaderSkeleton";
import LoadingChat from "@/components/LoadingChat";
import Linkify from "linkify-react";
import { VscReactions } from "react-icons/vsc";
import Reactions from "@/app/chats/_components/Reactions";
import { useInView } from "react-intersection-observer";
function Chatboard({ conversationId }: { conversationId: string }) {
  const { socket } = useSocketStore();
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [message, setMessage] = useState<string>("");
  const [openEmoji, setOpenEmoji] = useState(false);
  const { data: session, status } = useSession();
  const [hoveredMessage, setHoveredMessage] = useState<string | undefined>("");
  const [openReaction, setOpenReaction] = useState<string | undefined>("");
  const [hasNextPage, setHasNextPage] = useState(true);
  const { ref, inView } = useInView();
  const { data, fetchNextPage, error, isLoading, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ["message", conversationId],
      queryFn: async ({ pageParam = 0 }): Promise<any> => {
        const response = await axios.get(
          `${serverUrl}/api/messages/receiver-info/${
            session?.user.userId
          }/conversation/${conversationId}?page=${pageParam}&limit=${10}`
        );
        return response.data.message;
      },
      getNextPageParam: (lastPage, allPages) => {
        if (lastPage.nextPage === null && hasNextPage) {
          setHasNextPage(false);
        }
        return lastPage?.nextPage ?? null;
      },
      cacheTime: 0,
      refetchOnWindowFocus: false,
      enabled: status === "authenticated",
    });

  const getUserInfo = data?.pages[0]?.getUserInfo;
  const queryClient = useQueryClient();
  useLayoutEffect(() => {
    if (!inView && !isFetchingNextPage) {
      scrollRef.current?.scrollIntoView({ block: "end" });
    }
  }, [inView, data?.pages, isFetchingNextPage]);
  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, fetchNextPage, inView]);
  useEffect(() => {
    if (!socket || status !== "authenticated") return;
    socket.emit("join-room", conversationId);
    socket.on("display-message", ({ getProfile, conversation }) => {
      queryClient.setQueryData<ConversationAndMessagesSchema | undefined>(
        ["message", conversationId],
        (cachedData: any) => {
          const { getMessages } = cachedData || {};
          return { ...cachedData, getMessages: [...getMessages, getProfile] };
        }
      );
    });
    return () => {
      socket.off("display-message");
      socket.emit("leave-room", conversationId);
    };
  }, [conversationId, queryClient, socket, status]);
  useEffect(() => {
    if (!socket) return;
    socket.on("display-seen-text", ({ user, totalUnreadMessages }) => {
      queryClient.setQueryData<ConversationAndMessagesSchema | undefined>(
        ["message", conversationId],
        (cachedData) => {
          if (cachedData) {
            return {
              ...cachedData,
              getUserInfo: {
                ...cachedData?.getUserInfo,
                hasUnreadMessages: {
                  ...cachedData?.getUserInfo?.hasUnreadMessages,
                  user,
                  totalUnreadMessages,
                },
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
      participantId: getUserInfo?.receiver_details?._id,
    });
  }, [
    conversationId,
    getUserInfo?.receiver_details._id,
    socket,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    data?.pages[0]?.getMessages,
  ]);
  const flattenArr = useMemo(() => {
    return (
      data?.pages
        .filter((page) => page) //For removing the undefined element in page params
        // .sort((a, b) => a.nextPage - b.nextPage) //to sorted out the message ASCENDING
        .flatMap((page) => page.getMessages)
        .sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        )
    ); //To flatten the sub array inside of an array and retrieve only the getMessage
  }, [data?.pages]); //Run only when there is a changes to the data
  if (conversationId.toLowerCase() === "new") {
    return <NewUser />;
  }
  // if (isError) {
  //   const error = error as AxiosError;
  //   if (error.response?.status === 404) {
  //     return <UserNotFound />;
  //   }
  // }
  function sendMessage(messageContent: string) {
    queryClient.setQueryData<ConversationAndMessagesSchema | undefined>(
      ["message", conversationId],
      (data: any) => {
        console.log(data);
        const { getMessages, getUserInfo } = data || {};
        const firstPage = data?.pages[0];
        if (firstPage) {
          return {
            ...data, //the page params
            pages: [
              {
                ...firstPage,
                getUserInfo: {
                  ...getUserInfo,
                  hasUnreadMessages: {
                    ...getUserInfo?.hasUnreadMessages,
                    totalUnreadMessages: getUserInfo?.hasUnreadMessages + 1,
                  },
                },
                getMessages: [
                  ...getMessages,
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
                ],
              },
            ],
          };
        } else {
          return {
            ...data,
            getMessages: [
              {
                message,
                sender: {
                  name: session?.user.name.split(" ")[0],
                  status: "Online",
                  profilePic: session?.user.image,
                  _id: session?.user.userId,
                },
                isRead: false,
              },
            ],
          };
        }
      }
    );
  }
  console.log(data?.pages);
  return (
    <div
      onClick={() => setOpenEmoji(false)}
      className="flex flex-grow w-full h-full flex-col"
    >
      <header className="w-full shadow-md py-3 px-4 flex items-center justify-between">
        {isLoading || !data ? (
          <ChatBoardHeaderSkeleton />
        ) : (
          <div className="flex items-center space-x-3">
            <div className="w-[40px] h-[40px] relative rounded-full">
              <Image
                src={getUserInfo?.receiver_details.profilePic}
                alt="profile-image"
                fill
                sizes="100%"
                priority
                className="rounded-full absolute"
              />
              <span
                className={`${
                  getUserInfo?.receiver_details.status === "Online"
                    ? "bg-green-500"
                    : "bg-zinc-500"
                } absolute bottom-[2px] right-[2px] w-2 h-2 rounded-full`}
              ></span>
            </div>
            <div>
              <h3 className="text-white text-sm">
                {getUserInfo?.receiver_details.name}
              </h3>
              <small className="text-slate-300">
                {getUserInfo?.receiver_details.status === "Online"
                  ? "Active Now"
                  : "Offline"}
              </small>
            </div>
          </div>
        )}
        <button className="text-[1.5rem] text-[#6486FF]">
          <HiOutlineDotsCircleHorizontal />
        </button>
      </header>
      <div className="flex-grow w-full p-3">
        {isLoading || !data ? (
          <LoadingChat />
        ) : (
          <div className="h-full w-full">
            {data?.pages[0]?.getMessages?.length === 0 ? (
              <div className="flex items-center flex-col justify-end h-full w-full pb-5 space-y-2">
                <h3 className="text-zinc-300 text-[0.78rem]">
                  Wave to {getUserInfo.receiver_details.name}
                </h3>
                <button
                  onClick={() => {
                    socket?.emit("send-message", {
                      message: "👋",
                      conversationId,
                      participantId: getUserInfo.receiver_details._id,
                    });
                    sendMessage("👋");
                  }}
                  className="bg-[#414141] text-lg px-3 py-1.5 rounded-md overflow-hidden"
                >
                  <span className="mr-1">👋</span>
                </button>
              </div>
            ) : (
              <div className="w-full max-h-[430px] overflow-y-auto flex flex-col space-y-3 relative pr-2">
                {/* <div className="flex w-full items-center justify-center absolute">
                  <button
                    onClick={() => {
                      fetchNextPage();
                      setCurrentPage((prev) => prev + 1);
                    }}
                    className="text-sm rounded-3xl bg-[#414141] text-[#6486FF] px-2.5 py-2 flex items-center space-x-2 cursor-pointer relative z-50"
                  >
                    <span>
                      <IoReload />
                    </span>
                    <span>Load Previous Messages</span>
                  </button>
                </div> */}
                {hasNextPage && (
                  <div ref={ref} className="w-full absolute top-0 z-50">
                    <span>
                      <LoadingChat />
                    </span>
                  </div>
                )}
                {flattenArr?.map((data: Messages) => (
                  <Linkify
                    key={data._id}
                    options={{
                      attributes: { target: "_blank" },
                      className: "styled-link",
                    }}
                  >
                    <div
                      className={`flex space-x-2 w-full relative z-10 ${
                        data.sender._id === session?.user.userId
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        onMouseMove={() => {
                          setHoveredMessage(data._id);
                        }}
                        onMouseLeave={() => {
                          setHoveredMessage("");
                          setOpenReaction("");
                        }}
                        className={`w-1/2 flex ${
                          data.sender._id === session?.user.userId
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >
                        <div
                          className={`flex items-end gap-1  ${
                            data.sender._id !== session?.user.userId &&
                            "flex-row-reverse"
                          }`}
                        >
                          <div className="flex flex-col">
                            <small
                              className={`font-semibold text-[0.7rem] text-white ${
                                data.sender._id === session?.user.userId &&
                                "text-end hidden"
                              }`}
                            >
                              {data?.sender?.name.split(" ")[0] ?? ""}
                            </small>
                            {/* ChatBox */}
                            <div
                              className={`flex items-center w-full  ${
                                data.sender._id === session?.user.userId &&
                                "flex-row-reverse"
                              }`}
                            >
                              <div
                                className={`p-2 rounded-md flex items-center justify-center break-all ${
                                  data.sender._id === session?.user.userId
                                    ? "bg-[#6486FF]"
                                    : "bg-[#171717]"
                                }`}
                              >
                                <span className="text-white">
                                  {data?.message}
                                </span>
                              </div>

                              {/* Reactions */}
                              <div className={`px-2 relative`}>
                                <button
                                  onClick={() => {
                                    setOpenReaction((prevData) =>
                                      prevData ? "" : data._id
                                    );
                                    setHoveredMessage(data._id);
                                  }}
                                  className={`w-5 h-5 rounded-full items-center justify-center ${
                                    data._id === hoveredMessage
                                      ? "flex"
                                      : "hidden"
                                  }`}
                                >
                                  <span
                                    className={`text-slate-300 font-bold text-lg`}
                                  >
                                    <VscReactions />
                                  </span>
                                </button>
                                {openReaction === data._id && (
                                  <Reactions messageId={data._id ?? ""} />
                                )}
                              </div>
                            </div>
                          </div>
                          <div
                            className={`w-[32px] h-[32px] rounded-full relative px-4 py-2 ${
                              data.sender._id === session?.user.userId &&
                              "hidden"
                            }`}
                          >
                            <Image
                              src={data.sender.profilePic ?? emptyChat}
                              alt="profile-pic"
                              fill
                              sizes="100%"
                              className="rounded-full absolute"
                              priority
                            />
                            <span
                              className={`w-2 h-2 ${
                                data.sender.status === "Online"
                                  ? "bg-green-500"
                                  : "bg-slate-500"
                              } rounded-full absolute right-[1px] bottom-[2px]`}
                            ></span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Linkify>
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
                <div ref={scrollRef} className="relative top-5"></div>
                {/* {currentPage > 1 && (
                  <div className="flex w-full items-center justify-center absolute bottom-0">
                    <button
                      onClick={() => {
                        setCurrentPage((prev) => prev - 1);
                      }}
                      className="text-sm rounded-3xl bg-[#414141] text-[#6486FF] px-2.5 py-2 flex items-center space-x-2 cursor-pointer relative z-50"
                    >
                      <span>
                        <IoReload />
                      </span>
                      <span>Load Previous Messages</span>
                    </button>
                  </div>
                )} */}
              </div>
            )}
          </div>
        )}
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!socket) return;
          socket.emit("send-message", {
            message,
            conversationId,
            participantId: getUserInfo.receiver_details._id,
          });

          sendMessage(message);
          setMessage("");
        }}
        className="px-3 py-2.5 flex items-center space-x-2 bg-[#171717]"
      >
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          type="text"
          placeholder="Send a message"
          className="rounded-md bg-[#414141] flex-grow px-3 py-2.5 text-white"
        />
        <div className="relative">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setOpenEmoji((prev) => !prev);
            }}
            className={`px-3 flex py-3 rounded-md items-center text-[#6486FF] text-xl ${
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
        <button
          type="submit"
          disabled={!message.trim()}
          className="px-5 flex space-x-2 bg-[#6486FF] py-2.5 rounded-md items-center text-zinc-200 disabled:bg-slate-700 disabled:text-zinc-400"
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

export default Chatboard;
