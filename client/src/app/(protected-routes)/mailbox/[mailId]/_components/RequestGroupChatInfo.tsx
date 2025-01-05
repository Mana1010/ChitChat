import React from "react";
import { MailDetailsSchema } from "@/types/app.types";
import { motion } from "framer-motion";
import Image from "next/image";
import { MdGroups } from "react-icons/md";
import { MdKeyboardDoubleArrowRight } from "react-icons/md";
interface GroupChatInfoProps {
  getGroupInfo: MailDetailsSchema["group_details"] | undefined;
  requester: MailDetailsSchema["sender_details"] | undefined;
}
function RequestGroupChatInfo({ getGroupInfo, requester }: GroupChatInfoProps) {
  return (
    <motion.div
      initial={{ opacity: 0.3, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.1 }}
      exit={{ scale: 0, opacity: 0.3 }}
      className="absolute inset-x-0 rounded-sm mail-details-background bottom-[70px] px-3 flex flex-col"
    >
      <div className="flex justify-between items-center py-3">
        <div className="flex items-center space-x-3">
          <div className="w-14 h-14 relative rounded-full border border-[#6486FF] flex items-center justify-center">
            <Image
              src={getGroupInfo?.groupPhoto as string}
              alt={`${getGroupInfo?.groupName}'s groupchat profile`}
              priority
              width={50}
              height={50}
              className=" rounded-full"
            />
          </div>
          <div>
            <h1 className="text-white font-bold">{getGroupInfo?.groupName}</h1>
            <div className="flex space-x-1 items-center">
              <span className="text-[#6486FF] text-md">
                <MdGroups />
              </span>
              <span className="text-[0.8rem]">
                {getGroupInfo?.total_members}
              </span>
            </div>
          </div>
        </div>
        <span className="text-zinc-400 flex items-center">
          <MdKeyboardDoubleArrowRight />
        </span>
      </div>
      <div className="flex space-x-1 items-center self-end justify-end pb-2">
        <Image
          src={requester?.profilePic as string}
          width={15}
          height={15}
          priority
          alt="user-profile"
          className="rounded-full"
        />
        <span className="text-[0.65rem]">
          {requester?.name} is requesting to join
        </span>
      </div>
    </motion.div>
  );
}

export default RequestGroupChatInfo;
