"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQueryClient, useInfiniteQuery } from "react-query";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useSession } from "next-auth/react";
import axios, { AxiosError } from "axios";
import { PRIVATE_SERVER_URL } from "@/utils/serverUrl";
import { User } from "@/types/shared.types";
import LoadingChat from "@/components/LoadingChat";
import { toast } from "sonner";
import { TbMessage2 } from "react-icons/tb";
import ConversationListSkeleton from "../../../_components/ConversationListSkeleton";
import useDebounce from "@/hooks/useDebounce.hook";
import useSearchUser from "@/hooks/useSearchUser.hook";
import { useInView } from "react-intersection-observer";
import NoItemFound from "@/components/NoItemFound";
import { useSocketStore } from "@/utils/store/socket.store";
import Skeleton from "../../../_components/Skeleton";
function UserList({ searchUser }: { searchUser: string }) {
  const router = useRouter();
  const { privateSocket, statusSocket } = useSocketStore();
  const { ref, inView } = useInView();
  const [hasNextPage, setHasNextPage] = useState(true);
  const [allUserList, setAllUserList] = useState<User[]>([]);
  const currentPageRef = useRef(0);
  const { data: session, status } = useSession();
  const debouncedValue = useDebounce(searchUser);
  const { searchUser: debouncedSearchUser, isLoading: loadingSearchUser } =
    useSearchUser(debouncedValue);
  const { data, fetchNextPage, error, isLoading, isError } = useInfiniteQuery({
    queryKey: ["user-list"],
    queryFn: async ({ pageParam = 0 }) => {
      const response = await axios.get(
        `${PRIVATE_SERVER_URL}/all/user/${
          session?.user.userId
        }/list?page=${pageParam}&limit=${10}`
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
    enabled: status === "authenticated",
    onSuccess: (data) => {
      console.log("DATA in Private List");
      console.log(data);
      console.log(`Current Page ${currentPageRef.current}`);
      setAllUserList((prevData) => [
        ...prevData,
        ...data.pages[currentPageRef.current].getAllUsers,
      ]);
    },
    onError: (data) => {
      console.log("Error in Private List");
      console.log(data);
    },
  });
  const queryClient = useQueryClient();

  const chatUser = useMutation({
    mutationFn: async (data: { senderId: string; receiverId: string }) => {
      const response = await axios.post(`${PRIVATE_SERVER_URL}/new/chat`, data);
      return response.data;
    },
    onSuccess: ({ conversationId, is_already_chatting, senderId }) => {
      alert(`Sender Id ${senderId}`);
      if (!is_already_chatting) {
        privateSocket?.emit("add-conversation", { conversationId, senderId });
        queryClient.invalidateQueries("chat-list");
        queryClient.invalidateQueries("sidebar");
      }
      router.push(`/chats/private/${conversationId}?type=chats`);
    },
    onError: (err: AxiosError<{ message: string }>) => {
      toast.error(err.response?.data.message);
    },
  });
  const userList = useMemo(() => {
    return searchUser.length ? debouncedSearchUser : allUserList;
  }, [searchUser, debouncedSearchUser, allUserList]);

  useEffect(() => {
    queryClient.resetQueries(["user-list"]);
  }, [queryClient]);

  useEffect(() => {
    if (statusSocket) {
      statusSocket.on(
        "display-user-status",
        ({ userId, status: { type, lastActiveAt } }) => {
          setAllUserList((prevUserList: User[]) => {
            return prevUserList.map((user) => {
              if (user._id === userId) {
                return {
                  ...user,
                  status: {
                    type,
                    lastActiveAt,
                  },
                };
              } else {
                return user;
              }
            });
          });
        }
      );
    }
  }, [statusSocket]);

  useEffect(() => {
    if (inView && hasNextPage && !isLoading) {
      currentPageRef.current++;
      fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, inView, isLoading]);
  if (isLoading) {
    return <ConversationListSkeleton />;
  }
  if (loadingSearchUser) {
    //Loading animation for searching the user
    return <LoadingChat />;
  }

  if (isLoading) {
    return <Skeleton />;
  }

  if (data?.pages[0].getAllUsers.length === 0 && searchUser === "") {
    return (
      <div className="flex-grow w-full flex h-[200px]">
        <NoItemFound>No User Found</NoItemFound>
      </div>
    );
  }
  return (
    <div className="flex-grow w-full flex h-[200px]">
      {debouncedSearchUser?.length === 0 ? (
        <NoItemFound>
          No &quot;
          <span className="text-[#6486FF]">{searchUser.slice(0, 10)}</span>
          &quot; user found
        </NoItemFound>
      ) : (
        <div className="pt-2 flex flex-col w-full overflow-y-auto h-full flex-grow items-center px-1.5">
          {userList?.map((user: User) => (
            <div
              key={user._id}
              className="flex items-center w-full p-3.5 cursor-pointer hover:bg-[#414141] rounded-lg justify-between"
            >
              <div className="flex items-center space-x-2">
                <div className="w-[40px] h-[40px] relative rounded-full">
                  <Image
                    src={user.profilePic}
                    alt="profile-pic"
                    fill
                    sizes="100%"
                    priority
                    className="rounded-full absolute"
                  />
                  <span
                    className={`${
                      user.status.type === "online"
                        ? "bg-green-500"
                        : "bg-zinc-500"
                    } absolute bottom-[3px] right-[2px] w-2 h-2 rounded-full`}
                  ></span>
                </div>{" "}
                <h1 className="text-white font-bold text-sm break-all">
                  {user.name}
                </h1>
              </div>
              <button
                onClick={() => {
                  chatUser.mutate({
                    senderId: session?.user.userId as string,
                    receiverId: user._id,
                  });
                }}
                aria-label="Start chatting"
                className={`bg-[#6486FF] p-2.5 rounded-full text-white text-lg ${
                  user._id === session?.user.userId && "hidden"
                }`}
              >
                <TbMessage2 />
              </button>
            </div>
          ))}{" "}
        </div>
      )}
      {hasNextPage && <div ref={ref}></div>}
    </div>
  );
}

export default UserList;
