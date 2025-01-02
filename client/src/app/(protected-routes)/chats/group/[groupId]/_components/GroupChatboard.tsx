"use client";
import axios, { AxiosError } from "axios";
import React, {
  useEffect,
  useRef,
  useState,
  useLayoutEffect,
  Dispatch,
  SetStateAction,
} from "react";
import { useInfiniteQuery, useQueryClient } from "react-query";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { GROUP_SERVER_URL } from "@/utils/serverUrl";
import NoGroup from "./NoGroup";
import UserNotFound from "./UserNotFound";
import { GetParticipantInfo } from "@/types/user.types";
import { Message } from "@/types/shared.types";
import { useSocketStore } from "@/utils/store/socket.store";
import LoadingChat from "@/components/LoadingChat";
import { useInView } from "react-intersection-observer";
import GroupChatHeader from "./GroupChatHeader";
import { AnimatePresence, motion } from "framer-motion";
import ProfileCard from "../../../_components/ProfileCard";
import typingAnimation from "../../../../../../assets/images/gif-animation/typing-animation-ver-2.gif";
import SendAttachment from "@/components/SendAttachment";
import useGroupInfo from "@/hooks/useGroupInfo.hook";
import { User, Reaction } from "@/types/shared.types";
import GroupMessageField from "./GroupMessageField";
import GroupChatBubbles from "./GroupChatBubbles";
import { GroupChatInfo } from "@/types/group.types";
import BackToBottomArrow from "../../../_components/BackToBottomArrow";
import SystemChatBubbles from "../../../_components/SystemChatBubbles";
import SystemTimeChatBubbles from "../../../_components/SystemTimeChatBubbles";
import GroupDetails from "./GroupDetails";
function GroupChatboard({ groupId }: { groupId: string }) {
  const { groupSocket } = useSocketStore();
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const currentPageRef = useRef(0);
  const scrollDivRef = useRef<HTMLDivElement | null>(null);
  const scrollPositionRef = useRef<number>(0);
  const [openGroupDetailsModal, setOpenGroupDetailsModal] = useState(false);
  const [message, setMessage] = useState<string>("");
  const [openEmoji, setOpenEmoji] = useState(false);
  const { data: session, status } = useSession();
  const [hasNextPage, setHasNextPage] = useState(true);
  const [allMessages, setAllMessages] = useState<Message<User, Reaction[]>[]>(
    []
  );
  const [showArrowDown, setShowArrowDown] = useState(false);
  const [openAttachmentModal, setOpenAttachmentModal] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const { ref, inView } = useInView();

  const { groupInfo, isLoading: groupInfoLoading } = useGroupInfo(groupId);
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

  //We use useLayoutEffect to run this before the content is display in the browser which is to not visible the scroll to down.

  useLayoutEffect(() => {
    if (!scrollRef.current) return;
    if (currentPageRef.current <= 0) {
      scrollRef.current.scrollIntoView({ block: "end" });
    }
  }, [allMessages.length, groupInfo]);

  useEffect(() => {
    if (inView && hasNextPage) {
      currentPageRef.current++;
      fetchNextPage();
    }
  }, [hasNextPage, fetchNextPage, inView]);

  useEffect(() => {
    if (!groupSocket || status !== "authenticated" || !groupInfo?._id) return;

    groupSocket.emit("read-message", {
      groupId,
      participantId: groupInfo._id,
    });
  }, [groupId, groupInfo?._id, queryClient, groupSocket, status]);

  useEffect(() => {
    if (!groupSocket) return;

    groupSocket.on("display-seen-text", ({ user, totalUnreadMessages }) => {
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
    groupSocket.on("display-message", ({ messageDetails }) => {
      setAllMessages((prevMessages) => [...prevMessages, messageDetails]);
    });

    groupSocket.on("user-joined-group", ({ messageDetails }) => {
      alert("Joinedddd");
      console.log(messageDetails);
      setAllMessages((prevMessages) => [...prevMessages, messageDetails]);
      queryClient.setQueryData<GroupChatInfo | undefined>(
        ["group-info", groupId],
        (cachedData) => {
          if (cachedData && messageDetails) {
            return { ...cachedData, total_member: cachedData.total_member + 1 };
          } else {
            return cachedData;
          }
        }
      );
    });

    groupSocket.on("during-typing", (conversationId) => {
      setTypingUsers((prevUsers) => [...prevUsers, conversationId]);
    });
    groupSocket.on("stop-typing", (conversationId) => {
      setTypingUsers((prevUsers) =>
        prevUsers.filter((user) => user !== conversationId)
      );
    });
    return () => {
      groupSocket.off("display-seen-text");
      groupSocket.off("display-message");
      groupSocket.off("user-joined-group");
      groupSocket.off("during-typing");
      groupSocket.off("stop-typing");
    };
  }, [groupId, queryClient, groupSocket]);

  if (groupId.toLowerCase() === "new") {
    return <NoGroup />;
  }
  if (isError) {
    const errorMessage = error as AxiosError<{ message: string }>;
    if (errorMessage.response?.status === 404) {
      return <UserNotFound errorMessage={errorMessage.response.data.message} />;
    }
  }
  return (
    <div
      onClick={() => {
        setOpenEmoji(false);
      }}
      className="flex flex-grow w-full h-full flex-col relative bg-transparent"
    >
      <div className="flex-grow w-full groupchat-background-div flex flex-col">
        <GroupChatHeader
          groupInfo={groupInfo as any}
          isLoading={groupInfoLoading}
          setOpenGroupDetailsModal={setOpenGroupDetailsModal}
        />
        {isLoading || !data ? (
          <LoadingChat />
        ) : (
          <div className="h-full w-full relative">
            {" "}
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
              className="w-full max-h-[450px] overflow-y-auto flex flex-col space-y-3 relative px-3"
            >
              {hasNextPage && (
                <div ref={ref} className="w-full z-50">
                  <LoadingChat />
                </div>
              )}
              {allMessages?.map((data: Message<User, Reaction[]>) =>
                data.type === "text" ? (
                  <GroupChatBubbles
                    key={data._id}
                    messageDetails={data}
                    session={session}
                    groupId={groupId}
                    setMessage={setAllMessages}
                  />
                ) : data.type === "time" ? (
                  <SystemTimeChatBubbles message={data.message} />
                ) : (
                  <SystemChatBubbles
                    key={data._id}
                    senderName={data.sender.name}
                    senderId={data.sender._id}
                    userId={session?.user.userId as string}
                    message={data.message}
                  />
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
                  <BackToBottomArrow
                    setShowArrowDown={setShowArrowDown}
                    scrollRef={scrollRef.current}
                  />
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>
      <GroupMessageField
        groupSocket={groupSocket}
        groupId={groupId}
        message={message}
        openEmoji={openEmoji}
        senderId={session?.user.userId}
        scrollRef={scrollRef.current}
        session={session}
        setAllMessages={
          setAllMessages as Dispatch<
            SetStateAction<Message<User, Reaction[] | string>[]>
          >
        }
        setMessage={setMessage}
        setOpenEmoji={setOpenEmoji}
        setOpenAttachmentModal={setOpenAttachmentModal}
      />
      {openGroupDetailsModal && (
        <GroupDetails
          groupId={groupId}
          setOpenGroupDetailsModal={setOpenGroupDetailsModal}
        />
      )}
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
