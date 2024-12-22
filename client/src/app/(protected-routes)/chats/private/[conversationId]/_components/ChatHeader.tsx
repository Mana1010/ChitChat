"use client";
import React, { Dispatch, SetStateAction } from "react";
import ChatBoardHeaderSkeleton from "../../../_components/ChatBoardHeaderSkeleton";
import Image from "next/image";
import { HiOutlineDotsCircleHorizontal } from "react-icons/hi";
import { formatDistanceToNow } from "date-fns";
import { User } from "@/types/shared.types";
function ChatHeader({
  participantInfo,
  isLoading,
  setOpenProfileModal,
}: {
  participantInfo: User | undefined;
  isLoading: boolean;
  setOpenProfileModal: Dispatch<SetStateAction<boolean>>;
}) {
  return (
    <header className="w-full shadow-lg py-3 px-4 flex items-center justify-between ">
      {isLoading || !participantInfo ? (
        <ChatBoardHeaderSkeleton />
      ) : (
        <div className="flex items-center space-x-3">
          <div className="w-[40px] h-[40px] relative rounded-full">
            <Image
              src={participantInfo?.profilePic}
              alt="profile-image"
              fill
              sizes="100%"
              priority
              className="rounded-full absolute"
            />
            <span
              className={`${
                participantInfo.status.type === "online"
                  ? "bg-green-500"
                  : "bg-zinc-500"
              } absolute bottom-[2px] right-[2px] w-2 h-2 rounded-full`}
            ></span>
          </div>
          <div>
            <h3 className="text-white text-sm">{participantInfo.name}</h3>
            <small className="text-slate-300 text-[0.8rem]">
              {participantInfo.status.type === "online"
                ? "Active Now"
                : `Active ${formatDistanceToNow(
                    participantInfo.status.lastActiveAt,
                    {
                      addSuffix: true,
                    }
                  )}`}
            </small>
          </div>
        </div>
      )}
      <button
        onClick={() => setOpenProfileModal((prev) => !prev)}
        className="text-[1.5rem] text-[#6486FF]"
      >
        <HiOutlineDotsCircleHorizontal />
      </button>
    </header>
  );
}

export default ChatHeader;
