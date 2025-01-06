"use client";
import React, {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  Dispatch,
  SetStateAction,
} from "react";
import { useSession } from "next-auth/react";
import { Socket } from "socket.io-client";
import { useInfiniteQuery, useQueryClient } from "react-query";
import { PUBLIC_SERVER_URL } from "@/utils/serverUrl";
import axios from "axios";
import { User, Reaction } from "@/types/shared.types";
import Image from "next/image";
import { Message } from "@/types/shared.types";
import LoadingChat from "@/components/LoadingChat";
import { useInView } from "react-intersection-observer";
import { AnimatePresence } from "framer-motion";
import PublicChatBubbles from "./PublicChatBubbles";
import PublicMessageField from "./PublicMessageField";
import PublicReactionList from "./PublicReactionList";
import typingAnimate from "../../../../../assets/images/gif-animation/typing-animation-ver-2.gif";
import { useSocketStore } from "@/utils/store/socket.store";
import BackToBottomArrow from "../../_components/BackToBottomArrow";
import { Session } from "next-auth";

function PublicChat() {
  const [message, setMessage] = useState("");
  const { publicSocket, statusSocket } = useSocketStore();
  const { data: session } = useSession();
  const { ref, inView } = useInView();
  const [openEmoji, setOpenEmoji] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const scrollDivRef = useRef<HTMLDivElement | null>(null);
  const scrollPositionRef = useRef(0);
  const currentPageRef = useRef(0);
  const [showArrowDown, setShowArrowDown] = useState(false);
  const [allMessages, setAllMessages] = useState<Message<User, Reaction[]>[]>(
    []
  );

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
      const nextPage: Message<User, Reaction[]>[] =
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
        }
      );
    }
    return () => {
      statusSocket?.off("display-user-status");
    };
  }, [statusSocket]);

  useEffect(() => {
    if (!publicSocket) return;
    const handleGetMessages = (data: User) => {
      setAllMessages((prevMessages: any) => [...prevMessages, data]);
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
              if (messageDetails.reactions.length === 0) {
                return {
                  ...messageDetails,
                  reactions: [
                    ...messageDetails.reactions,
                    {
                      reactionEmoji: data.reactionEmoji,
                      reactionCreatedAt: data.reactionCreatedAt,
                      reactor: data.reactor,
                    },
                  ],
                };
              } else {
                return {
                  ...messageDetails,
                  reactions: messageDetails.reactions?.map((reaction) => {
                    if (reaction.reactor === data.reactor) {
                      return {
                        ...reaction,
                        reactionEmoji: data.reactionEmoji,
                        reactionCreatedAt: data.reactionCreatedAt,
                      };
                    } else {
                      return {
                        ...reaction,
                        reactionEmoji: data.reactionEmoji,
                        reactionCreatedAt: data.reactionCreatedAt,
                      };
                    }
                  }),
                };
              }
            } else {
              return messageDetails;
            }
          });
        });
      } else {
        setAllMessages((allMessages) => {
          return allMessages.map((messageDetails) => {
            if (messageDetails._id === data.messageId) {
              return {
                ...messageDetails,
                reactions: messageDetails.reactions?.filter((reaction) => {
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
    publicSocket.on("get-message", handleGetMessages);
    publicSocket.on("display-reaction", handleDisplayReaction);
    publicSocket.on("display-during-typing", handleDisplayDuringTyping);
    return () => {
      publicSocket?.off("get-message", handleGetMessages);
      publicSocket?.off("display-reaction", handleDisplayReaction);
      publicSocket?.off("display-during-typing", handleDisplayDuringTyping);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [publicSocket]);

  return (
    <div
      className="h-full relative flex flex-col"
      onClick={() => setOpenEmoji(false)}
    >
      <div className="public-background flex-grow w-full rounded-md relative h-1">
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
            {allMessages?.map((data: Message<User, Reaction[]>) => (
              <PublicChatBubbles
                key={data?._id}
                socket={publicSocket as Socket}
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
                <BackToBottomArrow
                  setShowArrowDown={setShowArrowDown}
                  scrollRef={scrollRef.current}
                />
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
      <PublicMessageField
        publicSocket={publicSocket}
        openEmoji={openEmoji}
        message={message}
        session={session as Session}
        scrollRef={scrollRef.current}
        setAllMessages={
          setAllMessages as Dispatch<
            SetStateAction<Message<User, Reaction[] | string>[]>
          >
        }
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
