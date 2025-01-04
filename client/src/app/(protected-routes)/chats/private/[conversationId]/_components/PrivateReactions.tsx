"use client";
import React, { Dispatch, SetStateAction } from "react";
import { useSocketStore } from "@/utils/store/socket.store";
import { Message } from "@/types/shared.types";
import { reactions } from "@/utils/constants";
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
    <div className=" absolute -top-10 -left-10 rounded-md bg-[#414141] flex items-center justify-center h-[40px] z-[99999]">
      {reactions.map((reaction) => (
        <button
          onClick={() => {
            setMessage((prev) => {
              return prev.map((message) => {
                if (messageId === message._id) {
                  const newReaction =
                    reaction.emoji === message.reactions ? "" : reaction.emoji;
                  sendReaction(newReaction);
                  return { ...message, reactions: newReaction };
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
              ? "bg-[#171717]/50"
              : "hover:bg-[#171717]/50"
          }`}
        >
          {reaction.emoji}
        </button>
      ))}
    </div>
  );
}

export default PrivateReactions;
