import React from "react";
import Image from "next/image";
import { MemberListSchema } from "@/types/group.types";
import { capitalizeFirstLetter } from "@/utils/capitalizeFirstLetter";
import { TbMessage2 } from "react-icons/tb";
function ActiveMembers({
  member_details,
  userId,
}: {
  member_details: MemberListSchema["member_details"];
  userId: string | undefined;
}) {
  return (
    <div
      className={`w-full flex space-between items-center p-2 rounded-sm ${
        member_details._id === userId && "bg-[#6486FF]/20"
      }`}
    >
      <div className="flex space-x-1 items-center w-full">
        <div className="w-10 h-10 relative rounded-full">
          <Image
            src={member_details.profilePic}
            fill
            sizes="100%"
            alt={`${member_details.name}'s profile picture`}
            className="absolute rounded-full"
            priority
          />
          <span></span>
        </div>
        <div className="leading-tight">
          <h3 className="text-white text-sm font-bold ">
            {member_details._id === userId ? "You" : member_details.name}
          </h3>
          <small className="text-zinc-400 text-[0.8rem] font-bold ">
            {capitalizeFirstLetter(member_details.role)}
          </small>
        </div>
      </div>
      {/* Actions */}
      <div>
        <button className="bg-[#6486FF] w-9 h-9 rounded-full flex items-center justify-center">
          <span className="text-white text-md">
            <TbMessage2 />
          </span>
        </button>
      </div>
    </div>
  );
}

export default ActiveMembers;
