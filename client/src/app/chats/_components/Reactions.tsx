import React from "react";
import { nanoid } from "nanoid";
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
function Reactions() {
  return (
    <div className="absolute -top-14 -left-20 px-2 rounded-md bg-[#414141] flex items-center justify-center space-x-1 h-[40px]">
      {reactions.map((reaction) => (
        <button key={reaction.id} className="text-2xl">
          {reaction.emoji}
        </button>
      ))}
    </div>
  );
}

export default Reactions;
