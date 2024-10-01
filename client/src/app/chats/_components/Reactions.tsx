"use client";
import React, { Dispatch, SetStateAction, useState } from "react";
import { nanoid } from "nanoid";
import { useSocketStore } from "@/utils/store/socket.store";
import { Messages } from "@/types/UserTypes";

const reactions = [
  {
    emoji: "👍",
    name: "like",
    id: nanoid(),
  },
  {
    emoji: "❤️",
    name: "love",
    id: nanoid(),
  },
  {
    emoji: "😆",
    name: "haha",
    id: nanoid(),
  },
  {
    emoji: "😢",
    name: "sad",
    id: nanoid(),
  },
  {
    emoji: "😮",
    name: "wow",
    id: nanoid(),
  },
  {
    emoji: "😡",
    name: "angry",
    id: nanoid(),
  },
  {
    emoji: "🤡",
    name: "clown",
    id: nanoid(),
  },
  {
    emoji: "💀",
    name: "skull",
    id: nanoid(),
  },
];
function Reactions({
  messageId,
  conversationId,
  messageDetails,
  setMessage,
  setOpenReaction,
}: {
  messageId: string;
  conversationId: string;
  messageDetails: Messages;
  setMessage: Dispatch<SetStateAction<Messages[]>>;
  setOpenReaction: Dispatch<SetStateAction<string | undefined>>;
}) {
  const { socket } = useSocketStore();

  return (
    <div className=" absolute -top-14 -left-25 rounded-md bg-[#414141] flex items-center justify-center h-[40px] z-[99999999999]">
      {reactions.map((reaction) => (
        <button
          onClick={() => {
            if (!socket) return;
            socket.emit("send-reaction", {
              reaction: reaction.emoji,
              messageId,
              conversationId,
            });
            setMessage((prev) => {
              return prev.map((message) => {
                if (messageId === message._id) {
                  if (reaction.emoji === message.reaction) {
                    return { ...message, reaction: "" };
                  }
                  return { ...message, reaction: reaction.emoji };
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
              ? "bg-slate-800"
              : "hover:bg-slate-800"
          }`}
        >
          {reaction.emoji}
        </button>
      ))}
    </div>
  );
}

export default Reactions;
