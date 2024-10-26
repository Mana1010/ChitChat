"use client";
import React, { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQueryClient, useInfiniteQuery } from "react-query";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useSession } from "next-auth/react";
import axios, { AxiosError } from "axios";
import { serverUrl, GROUP_SERVER_URL } from "@/utils/serverUrl";
import { User, GroupChat } from "@/types/UserTypes";
import noSearchFoundImg from "../../../../../assets/images/not-found.png";
import LoadingChat from "@/components/LoadingChat";
import { toast } from "sonner";
import ConversationListSkeleton from "@/app/chats/_components/ConversationListSkeleton";
import useDebounce from "@/hooks/useDebounce.hook";
import { useInView } from "react-intersection-observer";
import { MdOutlineGroupAdd } from "react-icons/md";
import useSearchGroup from "@/hooks/useSearchGroup.hook";
import NoItemFound from "@/components/NoItemFound";
import EmptyConversation from "@/components/EmptyConversation";
import { useModalStore } from "@/utils/store/modal.store";
function ParentDiv({ children }: { children: ReactNode }) {
  return <div className="flex-grow w-full flex">{children}</div>;
}
function GroupList({ searchGroup }: { searchGroup: string }) {
  const router = useRouter();
  const { ref, inView } = useInView();
  const { setShowCreateGroupForm } = useModalStore();
  const [hasNextPage, setHasNextPage] = useState(true);
  const [allGroupChatList, setAllGroupChatList] = useState<GroupChat[]>([]);
  const currentPageRef = useRef(0);
  const debouncedValue = useDebounce(searchGroup);
  const { searchGroup: debouncedSearchGroup, isLoading: loadingSearchGroup } =
    useSearchGroup(debouncedValue);
  const { data, fetchNextPage, error, isLoading, isError } = useInfiniteQuery({
    queryKey: ["group-list"],
    queryFn: async ({ pageParam = 0 }) => {
      const response = await axios.get(
        `${GROUP_SERVER_URL}/explore/all/group/list?page=${pageParam}&limit=${10}`
      );
      return response.data.message;
    },
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
    mutationFn: async (data: { senderId: string; receiverId: string }) => {
      const response = await axios.post(`${GROUP_SERVER_URL}/new/chat`, data);
      return response.data.message;
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries("chat-list");
      router.push(`/chats/private/${id}?type=chats`);
    },
    onError: (err: AxiosError<{ message: string }>) => {
      toast.error(err.response?.data.message);
    },
  });
  const groupList = useMemo(() => {
    return searchGroup.length ? debouncedSearchGroup : allGroupChatList;
  }, [searchGroup, debouncedSearchGroup, allGroupChatList]);
  useEffect(() => {
    if (inView && hasNextPage) {
      currentPageRef.current++;
      fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, inView]);

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
      <div className="pt-2 flex flex-col w-full overflow-y-auto h-full items-center px-1.5">
        {groupList?.map((group: GroupChat) => (
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
              </div>
              <h3>{group.groupName}</h3>
            </div>
            <button
              aria-label="Start chatting"
              className={`bg-[#6486FF] p-2.5 rounded-full text-white text-lg`}
            >
              <MdOutlineGroupAdd />
            </button>
          </div>
        ))}{" "}
      </div>
      {hasNextPage && <div ref={ref}></div>}
    </ParentDiv>
  );
}

export default GroupList;
