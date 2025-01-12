"use client";
import React, { Dispatch, SetStateAction, useState } from "react";
import {
  useQuery,
  useMutation,
  UseQueryResult,
  useQueryClient,
} from "react-query";
import { FaXmark } from "react-icons/fa6";
import { SHARED_SERVER_URL, PUBLIC_SERVER_URL } from "@/utils/serverUrl";
import axios, { AxiosError } from "axios";
import { ReactionListSchema } from "@/types/shared.types";
import Image from "next/image";
import { TbMessage2 } from "react-icons/tb";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useSocketStore } from "@/utils/store/socket.store";
import useAddConversation from "@/hooks/useAddConversation";
import { randomizeData } from "@/utils/randomizeData";
import { privateChatBoardBackgroundList } from "@/utils/constants";
function PublicReactionList({
  messageId,
  setOpenMessageIdReactionList,
  userId,
}: {
  messageId: string | null;
  setOpenMessageIdReactionList: Dispatch<SetStateAction<string | null>>;
  userId: string;
}) {
  const [selectedReaction, setSelectedReaction] = useState("All");
  const [allReactions, setAllReactions] = useState<ReactionListSchema[]>([]);
  const router = useRouter();
  const { publicSocket } = useSocketStore();
  const { addConversation } = useAddConversation(publicSocket);
  const getReactionList: UseQueryResult<
    ReactionListSchema[],
    AxiosError<{ message: string }>
  > = useQuery({
    queryKey: ["public-reaction-list", messageId],
    queryFn: async () => {
      const response = await axios.get(
        `${PUBLIC_SERVER_URL}/message/reaction/list/${messageId}`
      );
      setAllReactions(response.data.message);
      return response.data.message;
    },
    refetchOnWindowFocus: false,
    enabled: messageId !== null,
  });

  const reactionOnly = getReactionList.data?.map(
    ({ reactions }) => reactions.reactionEmoji
  );
  const removeDuplicatedReaction = [
    "All",
    ...Array.from(new Set(reactionOnly)),
  ];
  function resetReactionList() {
    setSelectedReaction("All");
    setAllReactions(getReactionList.data as ReactionListSchema[]);
  }

  function filterReactions(reactionCategory: string) {
    setSelectedReaction(reactionCategory);
    const filterReactions = getReactionList.data?.filter(
      (reaction) => reaction.reactions.reactionEmoji === reactionCategory
    );
    setAllReactions(filterReactions as ReactionListSchema[]);
  }

  function handlefilterReactions(reactionCategory: string) {
    if (reactionCategory === "All") {
      resetReactionList();
    } else {
      filterReactions(reactionCategory);
    }
  }

  return (
    <div className="absolute bg-black/60 flex items-center justify-center w-full inset-0 z-[9999999] px-3">
      <div className="reaction-list-background md:w-1/2 w-full h-[70%] rounded-sm">
        <div className="flex flex-col w-full h-full py-3.5 px-3">
          <header className="flex space-x-2 justify-between items-center w-full">
            <div className="space-x-2 flex items-center overflow-x-auto">
              {removeDuplicatedReaction.map((reaction) => (
                <div key={reaction} className={`relative`}>
                  <button
                    onClick={() => {
                      handlefilterReactions(reaction);
                    }}
                    className={`px-3 h-[45px] text-[#6486FF] font-bold ${
                      selectedReaction !== "All" && "text-white"
                    }`}
                  >
                    <span>{reaction}</span>
                    {reaction === "All" && (
                      <span className="pl-1.5 text-sm">
                        {getReactionList.data?.length}
                      </span>
                    )}
                  </button>
                  {selectedReaction === reaction && (
                    <span className="bg-[#6486FF] left-0 right-0 bottom-0 h-[2px] absolute"></span>
                  )}
                </div>
              ))}
            </div>
            <button
              onClick={() => setOpenMessageIdReactionList(null)}
              className="rounded-full w-8 h-8 shadow-slate-950 shadow-md text-[#6486FF] flex items-center justify-center text-lg"
            >
              <FaXmark />
            </button>
          </header>
          <div className="pt-3 flex flex-col overflow-y-auto flex-grow h-1">
            {allReactions.map((reactionList) => (
              <div
                key={reactionList._id}
                className="p-2.5 flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <div className="relative w-9 h-9 rounded-full">
                    <Image
                      src={reactionList.reactor_details.profilePic}
                      alt="profile"
                      fill
                      sizes="100%"
                      className="absolute rounded-full"
                      priority
                    />
                    <span className="-bottom-2 absolute -right-2">
                      {reactionList.reactions.reactionEmoji}
                    </span>
                  </div>
                  <h6 className="text-white text-sm font-semibold">
                    {reactionList.reactor_details.name}
                  </h6>
                </div>
                {reactionList.reactions.reactor !== userId && (
                  <button
                    onClick={() =>
                      addConversation({
                        senderId: userId,
                        receiverId: reactionList.reactions.reactor,
                        privateChatboardWallpaper: randomizeData(
                          privateChatBoardBackgroundList
                        ),
                      })
                    }
                    aria-label="Start chatting"
                    className={`bg-[#6486FF] p-2.5 rounded-full text-white text-lg`}
                  >
                    <TbMessage2 />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PublicReactionList;
