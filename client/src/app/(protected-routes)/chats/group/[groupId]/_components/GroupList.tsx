"use client";
import React, { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useInfiniteQuery, useQueryClient } from "react-query";
import Image from "next/image";
import { useSession } from "next-auth/react";
import axios, { AxiosError } from "axios";
import { GROUP_SERVER_URL } from "@/utils/serverUrl";
import { GroupChatList } from "@/types/group.types";
import LoadingChat from "@/components/LoadingChat";
import { toast } from "sonner";
import ConversationListSkeleton from "../../../_components/ConversationListSkeleton";
import useDebounce from "@/hooks/useDebounce.hook";
import { useInView } from "react-intersection-observer";
import { MdOutlineGroupAdd } from "react-icons/md";
import useSearchGroup from "@/hooks/useSearchGroup.hook";
import NoItemFound from "@/components/NoItemFound";
import EmptyConversation from "@/components/EmptyConversation";
import { useModalStore } from "@/utils/store/modal.store";
import { MdGroups } from "react-icons/md";
import { FaXmark } from "react-icons/fa6";
import { FaCheck } from "react-icons/fa6";
import { FaUserClock } from "react-icons/fa";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useSocketStore } from "@/utils/store/socket.store";
import useInvitationResponse from "@/hooks/useInvitationResponse";

function ParentDiv({ children }: { children: ReactNode }) {
  return <div className="flex-grow h-1">{children}</div>;
}
function GroupList({ searchGroup }: { searchGroup: string }) {
  const { ref, inView } = useInView();
  const { setShowCreateGroupForm } = useModalStore();
  const { data: session, status } = useSession();
  const [hasNextPage, setHasNextPage] = useState(true);
  const [allGroupChatList, setAllGroupChatList] = useState<GroupChatList[]>([]);
  const currentPageRef = useRef(0);
  const debouncedValue = useDebounce(searchGroup);
  const { groupSocket } = useSocketStore();

  const { acceptInvitation, declineInvitation } = useInvitationResponse(
    null,
    setAllGroupChatList,
    "in-group-list"
  );

  const { searchGroup: debouncedSearchGroup, isLoading: loadingSearchGroup } =
    useSearchGroup(debouncedValue);
  const { data, fetchNextPage, isLoading } = useInfiniteQuery({
    queryKey: ["explore-group-list"],
    queryFn: async ({ pageParam = 0 }) => {
      const response = await axios.get(
        `${GROUP_SERVER_URL}/explore/all/group/list/${
          session?.user.userId
        }?page=${pageParam}&limit=${10}`
      );
      return response.data.message;
    },
    enabled: status === "authenticated",
    getNextPageParam: (lastPage) => {
      if (lastPage.nextPage === null && hasNextPage) {
        setHasNextPage(false);
      }
      return lastPage.nextPage ?? null;
    },
    refetchOnWindowFocus: false,
    onSuccess: (data) => {
      setAllGroupChatList((prevData) => [
        ...prevData,
        ...data.pages[currentPageRef.current].getAllGroups,
      ]);
    },
  });
  const queryClient = useQueryClient();
  const joinGroup = useMutation({
    mutationFn: async ({ groupId }: { groupId: string }) => {
      const response = await axios.patch(
        `${GROUP_SERVER_URL}/join/group/${groupId}/${session?.user.userId}`
      );
      return response.data;
    },
    onSuccess: ({ message, groupId }) => {
      toast.success(message);
      groupSocket?.emit("send-group-request", { groupId });
      setAllGroupChatList((groupchat) => {
        return groupchat.map((group) => {
          if (group._id === groupId) {
            return { ...group, user_group_status: "requesting" };
          } else {
            return group;
          }
        });
      });
    },
    onError: (err: AxiosError<{ message: string }>) => {
      toast.error(err.response?.data.message);
    },
  });

  const groupList = useMemo(() => {
    return searchGroup.length ? debouncedSearchGroup : allGroupChatList;
  }, [searchGroup, debouncedSearchGroup, allGroupChatList]);

  useEffect(() => {
    if (
      inView &&
      hasNextPage &&
      !isLoading &&
      data?.pages?.[currentPageRef.current]?.getAllGroups
    ) {
      currentPageRef.current++;
      fetchNextPage();
    }
  }, [data?.pages, fetchNextPage, hasNextPage, inView, isLoading]);

  useEffect(() => {
    return () => {
      queryClient.resetQueries(["explore-group-list"]);
    };
  }, [queryClient]);

  if (isLoading) {
    return <ConversationListSkeleton />;
  }
  if (loadingSearchGroup) {
    //Loading animation for searching the user
    return <LoadingChat />;
  }

  if (data?.pages[0].getAllGroups.length === 0 && searchGroup === "") {
    return (
      <ParentDiv>
        <EmptyConversation>
          <h2 className="text-zinc-300 text-[1.1rem] break-all text-center">
            No any Group Chat Found.
          </h2>
          <button
            onClick={() => setShowCreateGroupForm(true)}
            className="bg-[#6486FF] px-3 py-2 text-white rounded-sm"
          >
            Create Group
          </button>
        </EmptyConversation>
      </ParentDiv>
    );
  }

  if (debouncedSearchGroup?.length === 0) {
    return (
      <ParentDiv>
        <NoItemFound>
          No &quot;
          <span className="text-[#6486FF]">{searchGroup.slice(0, 10)}</span>
          &quot; group found
        </NoItemFound>
      </ParentDiv>
    );
  }

  return (
    <ParentDiv>
      <div className="pt-2 flex flex-col w-full h-full items-center px-1.5 overflow-y-auto">
        {groupList?.map((group: GroupChatList) => (
          <div
            key={group._id}
            className="flex items-center w-full p-3.5 cursor-pointer hover:bg-[#414141] rounded-lg justify-between"
          >
            <div className="flex items-center space-x-2">
              <div className="w-[40px] h-[40px] relative rounded-full">
                <Image
                  src={group.groupPhoto}
                  alt="profile-pic"
                  fill
                  sizes="100%"
                  priority
                  className="rounded-full absolute"
                />
                <span
                  className={`${
                    group.is_group_active ? "bg-green-500" : "bg-zinc-500"
                  } absolute bottom-[3px] right-[2px] w-2 h-2 rounded-full`}
                ></span>
              </div>
              <div className="flex flex-col space-y-1">
                <h3 className="text-white">{group.groupName}</h3>
                <div className="flex items-center space-x-2">
                  <span className="text-[#6486FF]">
                    <MdGroups />
                  </span>
                  <span className="text-white text-[0.6rem] font-semibold">
                    {group.totalMember}
                  </span>
                </div>
              </div>
            </div>
            {group.user_group_status === "pending" ? (
              <div className="flex items-center space-x-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger
                      aria-label="Accept Invitation"
                      className={`bg-[#6486FF] p-2 rounded-full text-white text-lg`}
                      onClick={() =>
                        acceptInvitation({
                          groupId: group._id,
                          userId: session?.user.userId as string,
                        })
                      }
                    >
                      <FaCheck />
                    </TooltipTrigger>
                    <TooltipContent className="bg-[#6486FF]">
                      Accept Invitation
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger
                      aria-label="Decline Invitation"
                      className={`bg-[#6486FF] p-2 rounded-full text-white text-lg`}
                      onClick={() =>
                        declineInvitation({
                          groupId: group._id,
                          userId: session?.user.userId as string,
                        })
                      }
                    >
                      <FaXmark />
                    </TooltipTrigger>
                    <TooltipContent className="bg-[#6486FF]">
                      Decline Invitation
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            ) : group.user_group_status === "requesting" ? (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger
                    className={`bg-[#6486FF] p-2 rounded-full text-white text-lg cursor-default`}
                  >
                    <FaUserClock />
                  </TooltipTrigger>
                  <TooltipContent className="bg-[#6486FF]">
                    Requesting
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger
                    onClick={() =>
                      joinGroup.mutate({ groupId: group._id as string })
                    }
                    aria-label="Start chatting"
                    className={`bg-[#6486FF] p-2 rounded-full text-white text-lg`}
                  >
                    <MdOutlineGroupAdd />
                  </TooltipTrigger>
                  <TooltipContent className="bg-[#6486FF]">
                    Join Group
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        ))}{" "}
        {hasNextPage && <div ref={ref}></div>}
      </div>
    </ParentDiv>
  );
}

export default GroupList;
