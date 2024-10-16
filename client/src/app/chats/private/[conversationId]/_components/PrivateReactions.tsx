"use client";
import React, { Dispatch, SetStateAction, useState } from "react";
import { nanoid } from "nanoid";
import { useSocketStore } from "@/utils/store/socket.store";
import { Messages } from "@/types/UserTypes";
import { reactions } from "@/utils/reactions";
function PrivateReactions({
  messageId,
  conversationId,
  messageDetails,
  setMessage,
  setOpenReaction,
}: {
  messageId: string;
  conversationId?: string;
  messageDetails: Messages;
  setMessage: Dispatch<SetStateAction<Messages[]>>;
  setOpenReaction: Dispatch<SetStateAction<string | undefined>>;
}) {
  const { socket } = useSocketStore();
  function sendReaction(content: string) {
    if (!socket) return;
    socket.emit("send-reaction", {
      reaction: content,
      messageId,
      conversationId,
    });
  }
  return (
    <div className=" absolute -top-10 -left-25 rounded-md bg-[#414141] flex items-center justify-center h-[40px] z-[99999]">
      {reactions.map((reaction) => (
        <button
          onClick={() => {
            setMessage((prev) => {
              return prev.map((message) => {
                if (messageId === message._id) {
                  const newReaction =
                    reaction.emoji === message.reaction ? "" : reaction.emoji;
                  sendReaction(newReaction);
                  return { ...message, reaction: newReaction };
                } else {
                  return message;
                }
              });
            });
            setOpenReaction("");
          }}
          key={reaction.id}
          className={`text-2xl h-full p-1 ${
            messageDetails.reaction === reaction.emoji
              ? "bg-[#171717]"
              : "hover:bg-[#171717]"
          }`}
        >
          {reaction.emoji}
        </button>
      ))}
    </div>
  );
}

export default PrivateReactions;
