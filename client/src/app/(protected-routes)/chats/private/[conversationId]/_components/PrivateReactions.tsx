"use client";
import React, { Dispatch, SetStateAction, useState } from "react";
import { nanoid } from "nanoid";
import { useSocketStore } from "@/utils/store/socket.store";
import { Message } from "@/types/shared.types";
import { reactions } from "@/utils/reactions";
import { User } from "@/types/shared.types";
function PrivateReactions({
  messageId,
  conversationId,
  messageDetails,
  setMessage,
  setOpenReaction,
}: {
  messageId: string;
  conversationId?: string;
  messageDetails: Message<User>;
  setMessage: Dispatch<SetStateAction<Message<User>[]>>;
  setOpenReaction: Dispatch<SetStateAction<string | undefined>>;
}) {
  const { privateSocket } = useSocketStore();
  function sendReaction(content: string) {
    if (!privateSocket) return;
    privateSocket.emit("send-reaction", {
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
                    reaction.emoji === message.reactions ? "" : reaction.emoji;
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
            messageDetails.reactions === reaction.emoji
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
