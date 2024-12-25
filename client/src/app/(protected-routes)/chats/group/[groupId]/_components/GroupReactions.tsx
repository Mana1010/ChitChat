"use client";
import React, { Dispatch, SetStateAction, useState } from "react";
import { nanoid } from "nanoid";
import { useSocketStore } from "@/utils/store/socket.store";
import { Message, Reaction, User } from "@/types/shared.types";
import { reactions } from "@/utils/reactions";
function GroupReactions({
  messageDetails,
  messageId,
  conversationId,
  setMessage,
  setOpenReaction,
}: {
  messageId: string;
  conversationId?: string;
  messageDetails: any;
  setMessage: Dispatch<SetStateAction<Message<User, Reaction[]>[]>>;
  setOpenReaction: Dispatch<SetStateAction<string | undefined>>;
}) {
  const { groupSocket } = useSocketStore();
  function sendReaction(content: string) {
    if (!groupSocket) return;
    groupSocket.emit("send-reaction", {
      reaction: content,
      messageId,
      conversationId,
    });
  }
  return (
    <div className=" absolute -top-10 -left-25 rounded-md bg-[#414141] flex items-center justify-center h-[40px] z-[99999]">
      {reactions.map((reaction) => (
        <button
          // onClick={() => {
          //   setMessage((prev) => {
          //     return prev.map((message) => {
          //       if (messageId === message._id) {
          //         const newReaction =
          //           reaction.emoji === message.reactions ? "" : reaction.emoji;
          //         sendReaction(newReaction);
          //         return { ...message, reactions: newReaction };
          //       } else {
          //         return message;
          //       }
          //     });
          //   });
          //   setOpenReaction("");
          // }}
          key={reaction.id}
          className={`text-2xl h-full p-1 ${
            messageDetails === reaction.emoji
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

export default GroupReactions;
