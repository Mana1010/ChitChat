import { MemberListSchema } from "@/types/group.types";
import React from "react";
import { capitalizeFirstLetter } from "@/utils/capitalizeFirstLetter";
import Image from "next/image";
import { BiMailSend } from "react-icons/bi";
function InvitingMembers({
  member_details,
  userId,
}: {
  member_details: MemberListSchema["member_details"];
  userId: string | undefined;
}) {
  return (
    <div
      className={`w-full flex space-between items-center p-2 rounded-sm ${
        member_details._id === userId && "bg-[#6486FF]/10"
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
          <span
            className={`${
              member_details.status.type === "online"
                ? "bg-green-500"
                : "bg-zinc-500"
            } absolute bottom-[3px] right-[2px] w-2 h-2 rounded-full`}
          ></span>
        </div>
        <div className="leading-tight">
          <h3 className="text-white text-sm font-bold ">
            {member_details._id === userId ? "You" : member_details.name}
          </h3>
          <div className=" font-bold flex items-center space-x-1">
            <span className="text-[#6486FF]">
              <BiMailSend />
            </span>
            <span className="text-zinc-300">|</span>
            <span className="text-zinc-400 text-[0.8rem]">
              {capitalizeFirstLetter(member_details.role)}
            </span>
          </div>
        </div>
      </div>
      {/* Actions */}
      <div>
        {/* <button className="bg-[#6486FF] w-9 h-9 rounded-full text-white text-md">
          < />
        </button> */}
      </div>
    </div>
  );
}

export default InvitingMembers;
