import React, { Dispatch, SetStateAction, useMemo, useState } from "react";
import Image from "next/image";
import { Message, Reaction, User } from "@/types/shared.types";
import PublicReactions from "./PublicReaction";
import { VscReactions } from "react-icons/vsc";
import Linkify from "linkify-react";
import { Socket } from "socket.io-client";
import { MdOutlineContentCopy } from "react-icons/md";
import handleClipboard from "@/utils/clipboard";
import { handleDateFormat } from "@/utils/dateChatFormat";

import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
function PublicChatBubbles({
  messageDetails,
  socket,
  userData,
  setMessage,
  setOpenMessageIdReactionList,
}: {
  messageDetails: Message<User, Reaction[]>;
  socket: Socket | null;
  userData: User | undefined;
  setMessage: Dispatch<SetStateAction<Message<User, Reaction[]>[]>>;
  setOpenMessageIdReactionList: Dispatch<SetStateAction<string | null>>;
}) {
  const [hoveredMessage, setHoveredMessage] = useState<string | undefined>("");
  const [openReaction, setOpenReaction] = useState<string | undefined>("");
  const reactionOnly = useMemo(() => {
    return messageDetails.reactions?.map(({ reactionEmoji }) => reactionEmoji);
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
                {messageDetails.sender?.name}
              </small>
              {/* ChatBox */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger className="cursor-text">
                    {" "}
                    <div
                      onMouseMove={() => setHoveredMessage(messageDetails._id)}
                      onMouseLeave={() => {
                        setHoveredMessage("");
                        setOpenReaction("");
                      }}
                      className={`flex items-center w-full flex-grow ${
                        messageDetails.sender?._id === userData.userId &&
                        "flex-row-reverse"
                      }`}
                    >
                      <div
                        className={`p-2 rounded-md flex items-center justify-center whitespace-pre-wrap relative ${
                          messageDetails.sender?._id === userData.userId
                            ? "bg-[#6486FF]"
                            : "backdrop-blur-sm backdrop-brightness-75"
                        }`}
                      >
                        <span className="text-white">
                          {messageDetails?.message}
                        </span>
                        {/* Display Reactions */}
                        {messageDetails.reactions?.length ? (
                          <button
                            onClick={() =>
                              setOpenMessageIdReactionList(messageDetails._id)
                            }
                            className={`absolute bottom-[-8px] text-[0.8rem] flex bg-[#3A3B3C] rounded-md px-1 items-center ${
                              messageDetails.sender?._id === userData.userId
                                ? "left-0"
                                : "right-0"
                            }`}
                          >
                            <div className="pr-[0.2rem]">
                              {Array.from(reactionList).map(
                                (reaction, index) => (
                                  <span key={index}>{reaction}</span>
                                )
                              )}
                            </div>

                            <span className="text-white text-[0.6rem]">
                              {reactionOnly.length}
                            </span>
                          </button>
                        ) : null}
                      </div>

                      {/* Reactions */}
                      <div className={`relative flex justify-center space-x-1`}>
                        {messageDetails.sender?._id !== userData.userId && (
                          <button
                            onClick={() => {
                              setOpenReaction((isOpen) =>
                                isOpen ? "" : messageDetails._id
                              );
                              setHoveredMessage(messageDetails._id);
                            }}
                            className={`w-5 h-5 items-center justify-center flex `}
                          >
                            {messageDetails._id === hoveredMessage && (
                              <span
                                className={`text-slate-300 font-bold text-lg`}
                              >
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

                        <button
                          onClick={async () => {
                            const { message, type } = await handleClipboard(
                              messageDetails.message
                            );

                            toast[type as "success" | "error"](message);
                          }}
                          className={`w-5 h-5 items-center justify-center flex `}
                        >
                          {messageDetails._id === hoveredMessage && (
                            <span
                              className={`text-slate-300 font-bold text-sm`}
                            >
                              {" "}
                              <MdOutlineContentCopy />
                            </span>
                          )}
                        </button>
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      {handleDateFormat(new Date(messageDetails.createdAt))}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
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
                  messageDetails.sender.status.type === "online"
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
