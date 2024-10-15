"use client";
import React, { Dispatch, SetStateAction, useState } from "react";
import { useQuery, useQueryClient, UseQueryResult } from "react-query";
import { reactions } from "@/utils/reactions";
import { FaXmark } from "react-icons/fa6";
import { serverUrl } from "@/utils/serverUrl";
import axios, { AxiosError } from "axios";
import { ReactionListSchema } from "@/types/UserTypes";

function PublicReactionList({
  messageId,
  setOpenMessageIdReactionList,
}: {
  messageId: string | null;
  setOpenMessageIdReactionList: Dispatch<SetStateAction<string | null>>;
}) {
  const [selectedReaction, setWSelectedReaction] = useState("All");
  const [allReactions, setAllReactions] = useState<ReactionListSchema[]>([]);
  const getReactionList: UseQueryResult<
    ReactionListSchema[],
    AxiosError<{ message: string }>
  > = useQuery({
    queryKey: ["public-reaction-list"],
    queryFn: async () => {
      const response = await axios.get(
        `${serverUrl}/api/messages/public/reaction-list/${messageId}`
      );
      setAllReactions(allReactions);
      return response.data.message;
    },
    refetchOnWindowFocus: false,
    enabled: messageId !== null,
  });
  const queryClient = useQueryClient();
  const reactionOnly = allReactions.map(
    ({ reactions }) => reactions.reactionEmoji
  );
  const removeDuplicatedReaction = Array.from(new Set(reactionOnly));

  function filterReactions(reactionCategory: string) {
    queryClient.setQueryData<ReactionListSchema[] | undefined>(
      ["public-reaction-list"],
      (oldData) => {
        if (oldData) {
          return oldData.filter((reaction: ReactionListSchema) => {
            return reaction.reactions.reactionEmoji === reactionCategory;
          });
        }
      }
    );
  }
  function resetReactionList() {
    queryClient.setQueryData(["public-reaction-list"], allReactions);
  }
  console.log(getReactionList.data);
  return (
    <div className="absolute bg-black/60 flex items-center justify-center w-full inset-0 z-[9999999] ">
      <div className="bg-[#222222] md:w-1/2 w-full h-[70%] rounded-sm">
        <div className="flex flex-col items-center w-full h-full py-3.5 px-3">
          <header className="flex space-x-2 justify-between items-center w-full">
            <div className="space-x-2 flex items-center overflow-x-auto w-full">
              <button
                onClick={resetReactionList}
                className="px-3 py-2 text-white font-bold"
              >
                All
              </button>
              {removeDuplicatedReaction.map((reaction) => (
                <button
                  onClick={() => {
                    filterReactions(reaction);
                  }}
                  className="px-3 py-2"
                  key={reaction}
                >
                  {reaction}
                </button>
              ))}
            </div>
            <button
              onClick={() => setOpenMessageIdReactionList(null)}
              className="rounded-full w-8 h-8 shadow-slate-950 shadow-md text-[#6486FF] flex items-center justify-center text-lg"
            >
              <FaXmark />
            </button>
          </header>
        </div>
      </div>
    </div>
  );
}

export default PublicReactionList;
