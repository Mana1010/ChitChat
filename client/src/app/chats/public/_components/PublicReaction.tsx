"use client";
import React, { Dispatch, SetStateAction, useState } from "react";
import { nanoid } from "nanoid";
import { Messages, PublicMessages } from "@/types/UserTypes";
import { User } from "next-auth";

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
function PublicReactions({
  messageId,
  messageDetails,
  setMessage,
  setOpenReaction,
}: {
  messageId: string;
  messageDetails: PublicMessages<User>;
  setMessage: Dispatch<SetStateAction<PublicMessages<User>[]>>;
  setOpenReaction: Dispatch<SetStateAction<string | undefined>>;
}) {
  return (
    <div className="absolute -top-10 -left-25 rounded-md bg-[#414141] flex items-center justify-center h-[40px] z-[99999]">
      {reactions.map((reaction) => (
        <button
          onClick={() => {
            // if (!socket) return;
            // socket.emit("send-reaction", {
            //   reaction: reaction.emoji,
            //   messageId,
            // });
            // setMessage((prev) => {
            //   return prev.map((message: PublicMessages<User>) => {
            //     if (messageId === message._id) {
            //       if (reaction.emoji === message.) {
            //         return { ...message, reaction: "" };
            //       }
            //       return { ...message, reaction: reaction.emoji };
            //     } else {
            //       return message;
            //     }
            //   });
            // });
            setOpenReaction("");
          }}
          key={reaction.id}
          className={`text-2xl h-full p-1 hover:bg-[#171717]`}
        >
          {reaction.emoji}
        </button>
      ))}
    </div>
  );
}

export default PublicReactions;
