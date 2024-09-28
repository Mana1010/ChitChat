"use client";
import React, { useState } from "react";
import Linkify from "linkify-react";
import Reactions from "@/app/chats/_components/Reactions";
import { Messages } from "@/types/UserTypes";
import { Session } from "next-auth";
import Image from "next/image";
import emptyChat from "../assets/images/empty-chat.png";
import { VscReactions } from "react-icons/vsc";
function ChatBubbles({
  messageDetails,
  session,
}: {
  messageDetails: Messages;
  session: Session | null;
}) {
  const [hoveredMessage, setHoveredMessage] = useState<string | undefined>("");
  const [openReaction, setOpenReaction] = useState<string | undefined>("");
  return (
    <Linkify
      options={{
        attributes: { target: "_blank" },
        className: "styled-link",
      }}
    >
      <div
        className={`flex space-x-2 w-full relative z-10 ${
          messageDetails.sender._id === session?.user.userId
            ? "justify-end"
            : "justify-start"
        }`}
      >
        <div
          onMouseMove={() => {
            setHoveredMessage(messageDetails._id);
          }}
          onMouseLeave={() => {
            setHoveredMessage("");
            setOpenReaction("");
          }}
          className={`w-1/2 flex ${
            messageDetails.sender._id === session?.user.userId
              ? "justify-end"
              : "justify-start"
          }`}
        >
          <div
            className={`flex items-end gap-1  ${
              messageDetails.sender._id !== session?.user.userId &&
              "flex-row-reverse"
            }`}
          >
            <div className="flex flex-col">
              <small
                className={`font-semibold text-[0.7rem] text-white ${
                  messageDetails.sender._id === session?.user.userId &&
                  "text-end hidden"
                }`}
              >
                {messageDetails?.sender?.name.split(" ")[0] ?? ""}
              </small>
              {/* ChatBox */}
              <div
                className={`flex items-center w-full  ${
                  messageDetails.sender._id === session?.user.userId &&
                  "flex-row-reverse"
                }`}
              >
                <div
                  className={`p-2 rounded-md flex items-center justify-center break-all ${
                    messageDetails.sender._id === session?.user.userId
                      ? "bg-[#6486FF]"
                      : "bg-[#171717]"
                  }`}
                >
                  <span className="text-white">{messageDetails?.message}</span>
                </div>

                {/* Reactions */}
                <div className={`px-2 relative`}>
                  <button
                    onClick={() => {
                      setOpenReaction((prevData) =>
                        prevData ? "" : messageDetails._id
                      );
                      setHoveredMessage(messageDetails._id);
                    }}
                    className={`w-5 h-5 rounded-full items-center justify-center ${
                      messageDetails._id === hoveredMessage ? "flex" : "hidden"
                    }`}
                  >
                    <span className={`text-slate-300 font-bold text-lg`}>
                      <VscReactions />
                    </span>
                  </button>
                  {openReaction === messageDetails._id && (
                    <Reactions messageId={messageDetails._id ?? ""} />
                  )}
                </div>
              </div>
            </div>
            <div
              className={`w-[32px] h-[32px] rounded-full relative px-4 py-2 ${
                messageDetails.sender._id === session?.user.userId && "hidden"
              }`}
            >
              <Image
                src={messageDetails.sender.profilePic ?? emptyChat}
                alt="profile-pic"
                fill
                sizes="100%"
                className="rounded-full absolute"
                priority
              />
              <span
                className={`w-2 h-2 ${
                  messageDetails.sender.status === "Online"
                    ? "bg-green-500"
                    : "bg-slate-500"
                } rounded-full absolute right-[1px] bottom-[2px]`}
              ></span>
            </div>
          </div>
        </div>
      </div>
    </Linkify>
  );
}

export default ChatBubbles;
