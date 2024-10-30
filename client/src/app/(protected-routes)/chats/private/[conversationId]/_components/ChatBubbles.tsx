"use client";
import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import Linkify from "linkify-react";
import PrivateReactions from "./PrivateReactions";
import { Messages } from "@/types/UserTypes";
import { Session } from "next-auth";
import Image from "next/image";
import emptyChat from "../../../../../../assets/images/empty-chat.png";
import { VscReactions } from "react-icons/vsc";
import { useSocketStore } from "@/utils/store/socket.store";

function ChatBubbles({
  messageDetails,
  session,
  participantId,
  conversationId,
  setMessage,
}: {
  messageDetails: Messages;
  session: Session | null;
  participantId: string;
  conversationId: string;
  setMessage: Dispatch<SetStateAction<Messages[]>>;
}) {
  const { socket } = useSocketStore();
  const [hoveredMessage, setHoveredMessage] = useState<string | undefined>("");
  const [openReaction, setOpenReaction] = useState<string | undefined>("");
  useEffect(() => {
    if (!socket) return;
    socket.on("display-reaction", ({ reaction, messageId }) => {
      setMessage((prev) => {
        return prev.map((message) => {
          if (message._id === messageId) {
            return { ...message, reaction };
          } else {
            return message;
          }
        });
      });
      return () => {
        socket.off("display-reaction");
      };
    });
  }, [setMessage, socket]);
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
                  className={`p-2 rounded-md flex items-center justify-center break-all relative ${
                    messageDetails.sender._id === session?.user.userId
                      ? "bg-[#6486FF]"
                      : "bg-[#171717]"
                  }`}
                >
                  <span className="text-white">{messageDetails?.message}</span>
                  {messageDetails.reaction && (
                    <button
                      className={`absolute bottom-[-10px] text-[0.8rem] ${
                        messageDetails.sender._id === session?.user.userId
                          ? "left-0"
                          : "right-0"
                      }`}
                    >
                      {messageDetails.reaction}
                    </button>
                  )}
                </div>

                {/* Reactions */}
                <div className={`px-2 relative`}>
                  {messageDetails.sender._id !== session?.user.userId && (
                    <button
                      onClick={() => {
                        setOpenReaction((prevData) =>
                          prevData ? "" : messageDetails._id
                        );
                        setHoveredMessage(messageDetails._id);
                      }}
                      className={`w-5 h-5 rounded-full items-center justify-center ${
                        messageDetails._id === hoveredMessage
                          ? "flex"
                          : "hidden"
                      }`}
                    >
                      <span className={`text-slate-300 font-bold text-lg`}>
                        <VscReactions />
                      </span>
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
