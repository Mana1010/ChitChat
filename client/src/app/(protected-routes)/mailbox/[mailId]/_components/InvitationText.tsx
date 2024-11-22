"use client";
import React, { useState } from "react";
import Image from "next/image";
import { MailDetailsSchema } from "@/types/app.types";
import invitationImg from "../../../../../assets/images/svg/invitation-img.svg";
import GroupChatInfo from "./GroupChatInfo";
import { AnimatePresence } from "framer-motion";
function InvitationText({
  getMailContent,
}: {
  getMailContent: MailDetailsSchema | undefined;
}) {
  const [showInfoModal, setShowInfoModal] = useState(false);
  return (
    <div className="w-full flex flex-col relative text-white justify-center items-center">
      <div className="flex flex-col space-y-1 items-center">
        <Image
          src={invitationImg}
          alt="invitation-image"
          width={300}
          height={300}
          priority
        />
        <div className="w-1/2 space-y-2 flex flex-col relative">
          <div className="flex flex-col ">
            <h3 className="text-[0.9rem] font-bold">Join Our Group Chat!</h3>
            <span className="leading-6 text-[0.9rem] py-3">
              Hey there! 👋 We&apos;d love to have you join our group chat.
              It&apos;s a great place to connect, share ideas, and have some fun
              together! See the info below:
            </span>
            <button
              onMouseEnter={() => setShowInfoModal((prev) => !prev)}
              onMouseLeave={() => setShowInfoModal((prev) => !prev)}
              className="text-[#6486FF] text-[0.9rem] self-start hover:text-[#6486FF]/65 hover:underline hover:decoration-[#6486FF] underline-offset-2"
            >
              Hover to see info
            </button>
          </div>
          <AnimatePresence mode="wait">
            {showInfoModal && <GroupChatInfo getGroupInfo={getMailContent} />}
          </AnimatePresence>
          <div className="self-center md:self-end flex text-[0.9rem] space-x-2">
            <button className="bg-[#6486FF] px-3 py-2 rounded-sm text-white text-[0.9rem]">
              Accept
            </button>
            <button className="bg-[#414141] px-3 py-2 rounded-sm text-white text-[0.9rem]">
              Decline
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InvitationText;
