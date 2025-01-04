"use client";
import React, { Dispatch, SetStateAction } from "react";
import ChatBoardHeaderSkeleton from "../../../_components/ChatBoardHeaderSkeleton";
import Image from "next/image";
import { HiOutlineDotsCircleHorizontal } from "react-icons/hi";
import { GroupChatInfo } from "@/types/group.types";
import { MdGroups } from "react-icons/md";
function GroupChatHeader({
  groupInfo,
  isLoading,
  setOpenGroupDetailsModal,
}: {
  groupInfo: GroupChatInfo | undefined;
  isLoading: boolean;
  setOpenGroupDetailsModal: Dispatch<SetStateAction<boolean>>;
}) {
  return (
    <header className="w-full shadow-md py-3 px-4 flex items-center justify-between">
      {isLoading || !groupInfo ? (
        <ChatBoardHeaderSkeleton />
      ) : (
        <div className="flex items-center space-x-3">
          <div className="w-[40px] h-[40px] relative rounded-full">
            <Image
              src={groupInfo?.groupPhoto}
              alt="profile-image"
              fill
              sizes="100%"
              priority
              className="rounded-full absolute"
            />
            <span
              className={`${
                groupInfo.is_group_active ? "bg-green-500" : "bg-zinc-500"
              } absolute bottom-[2px] right-[2px] w-2 h-2 rounded-full`}
            ></span>
          </div>
          <div>
            <h3 className="text-white text-sm">{groupInfo.groupName}</h3>
            <div className="flex items-center space-x-1">
              <span className="text-[#6486FF]">
                <MdGroups />
              </span>
              <span className="text-white text-[0.65rem] font-semibold">
                {groupInfo.total_member}
              </span>
            </div>
          </div>
        </div>
      )}
      <button
        onClick={() => setOpenGroupDetailsModal((prev) => !prev)}
        className="text-[1.5rem] text-[#6486FF]"
      >
        <HiOutlineDotsCircleHorizontal />
      </button>
    </header>
  );
}

export default GroupChatHeader;
