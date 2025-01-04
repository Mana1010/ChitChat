import { nanoid } from "nanoid";
import { ReactionSchema } from "@/types/shared.types";
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
];

export const groupProfileList = [
  "group-icon-black",
  "group-icon-blue",
  "group-icon-brown",
  "group-icon-green",
  "group-icon-orange",
  "group-icon-pink",
  "group-icon-red",
  "group-icon-violet",
  "group-icon-yellow",
  "group-icon-white",
];

export const groupChatBoardBackgroundList = [
  "group-chat-1-background_ablmpv",
  "group-chat-2-background_zqrpi8",
  "group-chat-3-background_utuitm",
  "group-chat-4-background_accjvo",
  "group-chat-5-background_txnqcr",
  "group-chat-6-background_sn4pcr",
  "group-chat-7-background_wslybr",
  "group-chat-8-background_b6rbeo",
  "group-chat-9-background_i3wmqo",
  "group-chat-10-background_mgogyw",
  "group-chat-11-background_cksr2i",
];

export const privateChatBoardBackgroundList = [
  "private-chat-1-background_tpwgdh",
  "private-chat-2-background_c1tilb",
  "private-chat-3-background_litk1y",
  "private-chat-4-background_icf6j2",
  "private-chat-5-background_kpgpyb",
  "private-chat-6-background_cpeevp",
  "private-chat-7-background_u6zikl",
  "private-chat-8-background_vav7af",
  "private-chat-9-background_uhx0bh",
  "private-chat-10-background_tpyxzp",
];
