"use client";
import React, { useEffect, useState } from "react";
import { nanoid } from "nanoid";
import { useSocketStore } from "@/utils/store/socket.store";

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
function Reactions({ messageId }: { messageId: string }) {
  const { socket } = useSocketStore();
  const [pickedReaction, setPickedReaction] = useState<string>("");

  return (
    <div className="absolute -top-14 -left-20 rounded-md bg-[#414141] flex items-center justify-center h-[40px]">
      {reactions.map((reaction) => (
        <button
          onClick={() => setPickedReaction(reaction.emoji)}
          key={reaction.id}
          className="text-2xl p-1.5 hover:bg-slate-800"
        >
          {reaction.emoji}
        </button>
      ))}
    </div>
  );
}

export default Reactions;
