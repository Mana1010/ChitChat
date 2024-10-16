"use client";
import React, { Dispatch, SetStateAction, useState } from "react";
import { useQuery, useQueryClient, UseQueryResult } from "react-query";
import { reactions } from "@/utils/reactions";
import { FaXmark } from "react-icons/fa6";
import { serverUrl } from "@/utils/serverUrl";
import axios, { AxiosError } from "axios";
import { ReactionListSchema } from "@/types/UserTypes";
import Image from "next/image";
import { motion } from "framer-motion";
function PublicReactionList({
  messageId,
  setOpenMessageIdReactionList,
}: {
  messageId: string | null;
  setOpenMessageIdReactionList: Dispatch<SetStateAction<string | null>>;
}) {
  const [selectedReaction, setSelectedReaction] = useState("All");
  const [allReactions, setAllReactions] = useState<ReactionListSchema[]>([]);
  const getReactionList: UseQueryResult<
    ReactionListSchema[],
    AxiosError<{ message: string }>
  > = useQuery({
    queryKey: ["public-reaction-list", messageId],
    queryFn: async () => {
      const response = await axios.get(
        `${serverUrl}/api/messages/public/reaction-list/${messageId}`
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
    <div className="absolute bg-black/60 flex items-center justify-center w-full inset-0 z-[9999999]">
      <div className="bg-[#222222] md:w-1/2 w-full h-[70%] rounded-sm">
        <div className="flex flex-col w-full h-full py-3.5 px-3">
          <header className="flex space-x-2 justify-between items-center w-full">
            <div className="space-x-2 flex items-center">
              {removeDuplicatedReaction.map((reaction, index) => (
                <div key={reaction} className={`relative`}>
                  <button
                    onClick={() => {
                      handlefilterReactions(reaction);
                    }}
                    className={`px-3 h-[45px] text-[#6486FF] font-bold ${
                      selectedReaction !== "All" && "text-white"
                    }`}
                  >
                    {reaction}
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
          <div className="pt-3 flex flex-col overflow-auto-y flex-grow">
            {allReactions.map((reactionList) => (
              <div
                key={reactionList._id}
                className="p-2.5 flex space-x-2 items-center"
              >
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
                <h2 className="text-white">
                  {reactionList.reactor_details.name}
                </h2>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PublicReactionList;
