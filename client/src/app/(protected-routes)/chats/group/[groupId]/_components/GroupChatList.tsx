"use client";

import { GROUP_SERVER_URL } from "@/utils/serverUrl";
import axios, { AxiosError } from "axios";
import React, { useRef } from "react";
import { useEffect } from "react";
import { useQuery, UseQueryResult, useQueryClient } from "react-query";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSocketStore } from "@/utils/store/socket.store";
import ConversationListSkeleton from "../../../_components/ConversationListSkeleton";
import NoItemFound from "@/components/NoItemFound";
import EmptyConversation from "@/components/EmptyConversation";
import { GroupChatConversationList } from "@/types/group.types";
import { updateConversationList } from "@/utils/sharedUpdateFunction";
import { retrieveFirstName } from "@/utils/retrieveFirstName";
import debounceScroll from "@/hooks/debounceScroll";
import { DEFAULT_SCROLL_VALUE, GROUP_CHATLIST_KEY } from "@/utils/storageKey";
function GroupChatList({
  searchChat,
  groupId,
}: {
  searchChat: string;
  groupId: string;
}) {
  const { groupSocket } = useSocketStore();
  const { data: session, status } = useSession();
  const router = useRouter();
  const chatListRef = useRef<HTMLDivElement | null>(null);
  const debounce = debounceScroll(GROUP_CHATLIST_KEY);
  const displayAllGroupChat: UseQueryResult<
    GroupChatConversationList[],
    AxiosError<{ message: string }>
  > = useQuery({
    queryKey: ["groupchat-list"],
    queryFn: async () => {
      const response = await axios.get(
        `${GROUP_SERVER_URL}/all/groupchat/list/${session?.user.userId}`
      );
      return response.data.message;
    },
    refetchOnMount: false,
    enabled: status === "authenticated",
  });
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!groupSocket) return;
    groupSocket.on(
      "update-chatlist",
      ({ groupId, lastMessage, lastMessageCreatedAt, type, senderId }) => {
        updateConversationList(
          queryClient,
          lastMessage,
          groupId,
          senderId,
          type,
          "groupchat-list",
          lastMessageCreatedAt
        );
      }
    );
    groupSocket.on(
      "user-joined-group",
      ({
        groupChatDetails,
      }: {
        groupChatDetails: GroupChatConversationList;
      }) => {
        queryClient.setQueryData<GroupChatConversationList[]>(
          ["groupchat-list"],
          (cachedData: GroupChatConversationList[] | undefined) => {
            const data = cachedData || [];
            return [groupChatDetails, ...data];
          }
        );
      }
    );
    return () => {
      groupSocket.off("update-chatlist");
    };
  }, [groupSocket, queryClient]);

  useEffect(() => {
    if (chatListRef.current) {
      const scrollPosition = sessionStorage.getItem(GROUP_CHATLIST_KEY)
        ? JSON.parse(sessionStorage.getItem(GROUP_CHATLIST_KEY) || "")
        : sessionStorage.setItem(GROUP_CHATLIST_KEY, DEFAULT_SCROLL_VALUE);
      chatListRef.current.scrollTop = scrollPosition;
    }
  }, []);
  if (displayAllGroupChat.isLoading) {
    return <ConversationListSkeleton />;
  }
  const searchResult = displayAllGroupChat.data?.filter((groupchat) =>
    new RegExp(searchChat, "i").test(groupchat.groupName as string)
  );

  const handleLastMessage = (
    senderId: string,
    senderName: string,
    messageType: "file" | "system" | "text"
  ) => {
    const isUserSentThis = session?.user.userId === senderId;
    if (messageType === "text") {
      return isUserSentThis ? "You:" : "";
    } else if (messageType === "system") {
      return isUserSentThis ? "You" : retrieveFirstName(senderName);
    }
  };
  return (
    <div className="flex-grow flex h-[200px]">
      {displayAllGroupChat.data?.length === 0 && searchChat === "" ? (
        <EmptyConversation>
          <h2 className="text-zinc-300 text-[1.1rem] break-all text-center">
            Your conversation list is empty.
          </h2>
        </EmptyConversation>
      ) : searchChat && searchResult?.length === 0 ? (
        <NoItemFound>
          No &quot;
          <span className="text-[#6486FF]">{searchChat.slice(0, 10)}</span>
          &quot; group found
        </NoItemFound>
      ) : (
        <div
          ref={chatListRef}
          onScroll={(e) => {
            if (chatListRef.current) {
              const scroll = chatListRef.current.scrollTop;
              debounce(scroll, 200);
            }
          }}
          className="pt-2 flex flex-col w-full overflow-y-auto h-full flex-grow items-center px-1.5"
        >
          {searchResult?.map(
            (groupchat: GroupChatConversationList, index: number) => (
              <button
                onClick={() =>
                  router.push(`/chats/group/${groupchat._id}?type=chats`)
                }
                key={index}
                className={`flex items-center w-full p-3.5 cursor-pointer hover:bg-[#414141] rounded-lg justify-between ${
                  groupchat._id === groupId && "bg-[#414141]"
                }`}
              >
                <div className="flex items-center space-x-2 w-full">
                  <div className="md:w-[40px] md:h-[40px] w-[30px] h-[30px] relative rounded-full pr-2 shrink-0">
                    <Image
                      src={groupchat.groupPhoto.photoUrl}
                      alt="profile-pic"
                      fill
                      sizes="100%"
                      priority
                      className="rounded-full absolute"
                    />
                    <span
                      className={`${
                        groupchat.is_group_active
                          ? "bg-green-500"
                          : "bg-zinc-500"
                      } absolute bottom-[3px] right-[2px] w-2 h-2 rounded-full`}
                    ></span>
                  </div>{" "}
                  <div className="flex justify-start flex-col items-start w-full overflow-hidden">
                    <h1 className="text-white font-bold text-sm truncate w-[90%] text-start">
                      {groupchat.groupName}
                    </h1>
                    <small
                      className={`text-[0.75rem] text-white truncate w-[90%] text-start`}
                    >
                      {`${handleLastMessage(
                        groupchat.lastMessage.sender,
                        groupchat.sender_name,
                        groupchat.lastMessage.type
                      )} ${groupchat.lastMessage.text}`}
                    </small>
                  </div>
                </div>
                {/* <div
                  className={`w-2.5 h-2.5 rounded-full items-center justify-center bg-[#6486FF] ${
                    user.hasUnreadMessages.user === session?.user.userId &&
                    user.hasUnreadMessages.totalUnreadMessages !== 0
                      ? "flex"
                      : "hidden"
                  }`}
                ></div> */}
              </button>
            )
          )}{" "}
        </div>
      )}
    </div>
  );
}

export default GroupChatList;
