"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQueryClient, useInfiniteQuery } from "react-query";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useSession } from "next-auth/react";
import axios, { AxiosError } from "axios";
import { serverUrl } from "@/utils/serverUrl";
import { User } from "@/types/UserTypes";
import noSearchFoundImg from "../../../../../assets/images/not-found.png";
import LoadingChat from "@/components/LoadingChat";
import { toast } from "sonner";
import { TbMessage2 } from "react-icons/tb";
import ConversationListSkeleton from "@/app/chats/_components/ConversationListSkeleton";
import useDebounce from "@/hooks/useDebounce.hook";
import useSearchUser from "@/hooks/useSearchUser.hook";
import { InView, useInView } from "react-intersection-observer";
function UserList({ searchUser }: { searchUser: string }) {
  const router = useRouter();
  const { ref, inView } = useInView();
  const [hasNextPage, setHasNextPage] = useState(true);
  const [allUserList, setAllUserList] = useState<User[]>([]);
  const currentPageRef = useRef(0);
  const { data: session } = useSession();
  const debouncedValue = useDebounce(searchUser);
  const { searchUser: debouncedSearchUser, isLoading: loadingSearchUser } =
    useSearchUser(debouncedValue);
  const { data, fetchNextPage, error, isLoading, isError } = useInfiniteQuery({
    queryKey: ["user-list"],
    queryFn: async ({ pageParam = 0 }) => {
      const response = await axios.get(
        `${serverUrl}/api/messages/user-list?page=${pageParam}&limit=${10}`
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
      setAllUserList((prevData) => [
        ...prevData,
        ...data.pages[currentPageRef.current].getAllUsers,
      ]);
    },
  });
  const queryClient = useQueryClient();
  const chatUser = useMutation({
    mutationFn: async (data: { senderId: string; receiverId: string }) => {
      const response = await axios.post(
        `${serverUrl}/api/messages/newChat`,
        data
      );
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
  const userList = useMemo(() => {
    return searchUser.length ? debouncedSearchUser : allUserList;
  }, [searchUser, debouncedSearchUser, allUserList]);
  useEffect(() => {
    if (inView && hasNextPage) {
      currentPageRef.current++;
      fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, inView]);
  if (isLoading) {
    return <ConversationListSkeleton />;
  }
  if (loadingSearchUser) {
    //Loading animation for searching the user
    return <LoadingChat />;
  }

  return (
    <div className="flex-grow w-full flex">
      {debouncedSearchUser?.length === 0 ? (
        <div className="flex w-full items-center justify-center flex-col space-y-2 px-2">
          <Image
            src={noSearchFoundImg}
            width={100}
            height={100}
            alt="no-search-found"
            priority
          />

          <h2 className="text-zinc-300 text-[1.1rem] break-all text-center">
            No &quot;
            <span className="text-[#6486FF]">{searchUser.slice(0, 10)}</span>
            &quot; user found
          </h2>
        </div>
      ) : (
        <div className="pt-2 flex flex-col w-full overflow-y-auto h-full items-center px-1.5">
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
                      user.status === "Online" ? "bg-green-500" : "bg-zinc-500"
                    } absolute bottom-[3px] right-[2px] w-2 h-2 rounded-full`}
                  ></span>
                </div>{" "}
                <h1 className="text-white font-bold text-sm break-all">
                  {user._id === session?.user.userId ? "You" : user.name}
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
