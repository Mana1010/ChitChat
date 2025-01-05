"use client";
import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import Linkify from "linkify-react";
import PrivateReactions from "./PrivateReactions";
import { Message } from "@/types/shared.types";
import { Session } from "next-auth";
import Image from "next/image";
import emptyChat from "../../../../../../assets/images/empty-chat.png";
import { VscReactions } from "react-icons/vsc";
import { useSocketStore } from "@/utils/store/socket.store";
import { User } from "@/types/shared.types";
import handleClipboard from "@/utils/clipboard";
import { toast } from "sonner";
import { MdOutlineContentCopy } from "react-icons/md";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { handleDateFormat } from "@/utils/dateChatFormat";
function PrivateChatBubbles({
  messageDetails,
  session,
  conversationId,
  setMessage,
}: {
  messageDetails: Message<User>;
  session: Session | null;
  conversationId: string;
  setMessage: Dispatch<SetStateAction<Message<User>[]>>;
}) {
  const { privateSocket } = useSocketStore();
  const [hoveredMessage, setHoveredMessage] = useState<string | undefined>("");
  const [openReaction, setOpenReaction] = useState<string | undefined>("");
  useEffect(() => {
    if (!privateSocket) return;
    privateSocket.on("display-reaction", ({ reaction, messageId }) => {
      setMessage((prev) => {
        return prev.map((message) => {
          if (message._id === messageId) {
            return { ...message, reactions: reaction };
          } else {
            return message;
          }
        });
      });
      return () => {
        privateSocket.off("display-reaction");
      };
    });
  }, [setMessage, privateSocket]);
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
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger className="text-start">
                    {" "}
                    <div
                      className={`flex items-center w-full cursor-text ${
                        messageDetails.sender._id === session?.user.userId &&
                        "flex-row-reverse"
                      }`}
                    >
                      <div
                        className={`p-2 rounded-md flex items-center justify-center whitespace-pre-wrap relative ${
                          messageDetails.sender._id === session?.user.userId
                            ? "bg-[#6486FF]"
                            : "backdrop-blur-sm backdrop-brightness-75"
                        }`}
                      >
                        <span className="text-white">
                          {messageDetails?.message}
                        </span>
                        {messageDetails.reactions && (
                          <button
                            className={`absolute bottom-[-10px] text-[0.8rem] ${
                              messageDetails.sender._id === session?.user.userId
                                ? "left-0"
                                : "right-0"
                            }`}
                          >
                            {messageDetails.reactions}
                          </button>
                        )}
                      </div>

                      {/* Reactions */}
                      <div className={`relative flex justify-center space-x-1`}>
                        {messageDetails.sender._id !== session?.user.userId && (
                          <button
                            onClick={() => {
                              setOpenReaction((prevData) =>
                                prevData ? "" : messageDetails._id
                              );
                              setHoveredMessage(messageDetails._id);
                            }}
                            className={`w-5 h-5 items-center justify-center flex`}
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
                          <PrivateReactions
                            messageDetails={messageDetails}
                            messageId={messageDetails._id ?? ""}
                            conversationId={conversationId}
                            setMessage={setMessage}
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

export default PrivateChatBubbles;
