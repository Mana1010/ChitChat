"use client";
import { serverUrl, GROUP_SERVER_URL } from "@/utils/serverUrl";
import axios, { AxiosError } from "axios";
import React from "react";
import { useEffect } from "react";
import { useQuery, UseQueryResult, useQueryClient } from "react-query";
import { useSession } from "next-auth/react";
import { Conversation } from "@/types/UserTypes";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSocketStore } from "@/utils/store/socket.store";
import ConversationListSkeleton from "@/app/chats/_components/ConversationListSkeleton";
import NoItemFound from "@/components/NoItemFound";
import EmptyConversation from "@/components/EmptyConversation";
import { GroupChatConversationList } from "@/types/GroupTypes";
function GroupChatList({
  searchChat,
  groupId,
}: {
  searchChat: string;
  groupId: string;
}) {
  const { socket } = useSocketStore();
  const { data: session, status } = useSession();
  const router = useRouter();
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
    enabled: status === "authenticated",
  });
  const queryClient = useQueryClient();
  useEffect(() => {
    if (!socket || status === "unauthenticated") return;
    socket.on(
      "display-updated-chatlist",
      ({
        newMessage,
        messageType,
        conversationId,
        participantId,
        lastMessageCreatedAt,
      }) => {
        queryClient.setQueryData<GroupChatConversationList[] | undefined>(
          ["groupchat-list"],
          (prevData) => {
            if (prevData) {
              return prevData
                .map((conversation: GroupChatConversationList) => {
                  if (conversation._id === conversationId) {
                    return {
                      ...conversation,
                      lastMessage: {
                        sender: participantId,
                        text: newMessage,
                        messageType,
                        lastMessageCreatedAt,
                      },
                    };
                  } else {
                    return conversation;
                  }
                })
                .sort(
                  (a, b) =>
                    new Date(b.lastMessage.lastMessageCreatedAt).getTime() -
                    new Date(a.lastMessage.lastMessageCreatedAt).getTime()
                );
            } else {
              return [];
            }
          }
        );
      }
    );
    // socket.on("seen-message", ({ conversationId, hasUnreadMessages }) => {
    //   queryClient.setQueryData<Conversation[] | undefined>(
    //     ["chat-list"],
    //     (cachedData) => {
    //       if (cachedData) {
    //         return cachedData.map((conversation: Conversation) => {
    //           if (conversation._id === conversationId) {
    //             return {
    //               ...conversation,
    //               hasUnreadMessages: {
    //                 user: hasUnreadMessages.user,
    //                 totalUnreadMessages: hasUnreadMessages.totalUnreadMessages,
    //               },
    //             };
    //           } else {
    //             return conversation;
    //           }
    //         });
    //       }
    //     }
    //   );
    // });
    return () => {
      socket.off("display-updated-chatlist");
      socket.off("seen-message");
    };
  }, [queryClient, socket, status]);
  if (displayAllGroupChat.isLoading) {
    return <ConversationListSkeleton />;
  }
  const searchResult = displayAllGroupChat.data?.filter((groupchat) =>
    new RegExp(searchChat, "i").test(groupchat.groupName as string)
  );
  return (
    <div className="w-full flex-grow flex">
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
        <div className="pt-2 flex flex-col w-full overflow-y-auto h-[98%] items-center px-1.5">
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
                <div className="flex items-center space-x-2">
                  <div className="w-[40px] h-[40px] relative rounded-full pr-2">
                    <Image
                      src={groupchat.groupPhoto.photoUrl}
                      alt="profile-pic"
                      fill
                      sizes="100%"
                      priority
                      className="rounded-full absolute"
                    />
                    {/* <span
                      className={`${
                        user.receiver_details.status === "Online"
                          ? "bg-green-500"
                          : "bg-zinc-500"
                      } absolute bottom-[3px] right-[2px] w-2 h-2 rounded-full`}
                    ></span> */}
                  </div>{" "}
                  <div className="flex justify-start flex-col items-start">
                    <h1 className="text-white font-bold text-sm break-all">
                      {groupchat.groupName}
                    </h1>
                    <small className={`text-[0.75rem] break-all `}>
                      {`${
                        groupchat.lastMessage.sender === session?.user.userId
                          ? "You:"
                          : ""
                      } ${
                        groupchat.lastMessage.text.length >= 30
                          ? `${groupchat.lastMessage?.text?.slice(0, 30)}...`
                          : groupchat.lastMessage?.text
                      }`}
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
