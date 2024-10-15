import { nanoid } from "nanoid";
import { ReactionSchema } from "@/types/UserTypes";
export const reactions: ReactionSchema[] = [
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
