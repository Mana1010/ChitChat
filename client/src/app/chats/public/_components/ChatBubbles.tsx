"use client";
import React, { Dispatch, SetStateAction, useMemo, useState } from "react";
import Image from "next/image";
import { PublicMessages, User } from "@/types/UserTypes";
import PublicReactions from "./PublicReaction";
import { VscReactions } from "react-icons/vsc";
import { PiDotsThreeVerticalBold } from "react-icons/pi";
import Linkify from "linkify-react";
import { Socket } from "socket.io-client";
function PublicChatBubbles({
  messageDetails,
  socket,
  setMessage,
  userData,
}: {
  messageDetails: PublicMessages<User>;
  socket: Socket | null;
  setMessage: Dispatch<SetStateAction<PublicMessages<User>[]>>;
  userData: User;
}) {
  const [hoveredMessage, setHoveredMessage] = useState<string | undefined>("");
  const [openReaction, setOpenReaction] = useState<string | undefined>("");
  const reactionOnly = useMemo(() => {
    return messageDetails.reactions.map(({ reactionEmoji }) => reactionEmoji);
  }, [messageDetails]);
  const reactionList = new Set(reactionOnly); //To remove duplicate reaction
  if (!userData) return;
  return (
    <Linkify
      options={{
        attributes: { target: "_blank" },
        className: "styled-link",
      }}
    >
      <div
        className={`flex space-x-2 w-full relative z-10 ${
          messageDetails.sender?._id === userData.userId
            ? "justify-end"
            : "justify-start"
        }`}
      >
        <div
          className={`w-1/2 flex ${
            messageDetails.sender?._id === userData.userId
              ? "justify-end"
              : "justify-start"
          }`}
        >
          <div
            className={`flex items-end gap-1  ${
              messageDetails.sender?._id !== userData.userId &&
              "flex-row-reverse"
            }`}
          >
            <div className="flex flex-col">
              <small
                className={`font-semibold text-[0.7rem] text-white ${
                  messageDetails.sender?._id === userData.userId && "text-end"
                }`}
              >
                {messageDetails.sender?.name.split(" ")[0] ?? ""}
              </small>
              {/* ChatBox */}

              <div
                onMouseMove={() => setHoveredMessage(messageDetails._id)}
                onMouseLeave={() => {
                  setHoveredMessage("");
                  setOpenReaction("");
                }}
                className={`flex items-center w-full  ${
                  messageDetails.sender?._id === userData.userId &&
                  "flex-row-reverse"
                }`}
              >
                <div
                  className={`p-2 rounded-md flex items-center justify-center break-all relative ${
                    messageDetails.sender?._id === userData.userId
                      ? "bg-[#6486FF]"
                      : "bg-[#171717]"
                  }`}
                >
                  <span className="text-white">{messageDetails?.message}</span>
                  {/* Display Reactions */}
                  {messageDetails.reactions.length ? (
                    <button
                      className={`absolute bottom-[-8px] text-[0.8rem] flex bg-[#3A3B3C] rounded-md px-1 items-center ${
                        messageDetails.sender?._id === userData.userId
                          ? "left-0"
                          : "right-0"
                      }`}
                    >
                      <div className="pr-[0.2rem]">
                        {Array.from(reactionList).map((reaction, index) => (
                          <span key={index}>{reaction}</span>
                        ))}
                      </div>

                      <span className="text-white text-[0.6rem]">
                        {reactionOnly.length}
                      </span>
                    </button>
                  ) : null}
                </div>

                {/* Reactions */}
                <div className={`px-2 relative`}>
                  {messageDetails.sender?._id !== userData.userId && (
                    <button
                      onClick={() => {
                        setOpenReaction((isOpen) =>
                          isOpen ? "" : messageDetails._id
                        );
                        setHoveredMessage(messageDetails._id);
                      }}
                      className={`w-5 h-5 rounded-full items-center justify-center flex `}
                    >
                      {messageDetails._id === hoveredMessage && (
                        <span className={`text-slate-300 font-bold text-lg`}>
                          <VscReactions />
                        </span>
                      )}
                    </button>
                  )}

                  {openReaction === messageDetails._id && (
                    <PublicReactions
                      messageDetails={messageDetails as any}
                      userId={userData.userId as string}
                      socket={socket}
                      setMessage={setMessage as any}
                      setOpenReaction={setOpenReaction}
                    />
                  )}
                </div>
              </div>
            </div>
            <div className="w-[32px] h-[32px] rounded-full relative px-4 py-2">
              <Image
                src={messageDetails.sender?.profilePic}
                alt="profile-pic"
                fill
                sizes="100%"
                className="rounded-full absolute"
                priority
              />
              <span
                className={`w-2 h-2 ${
                  messageDetails.sender?.status === "Online"
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

export default PublicChatBubbles;
