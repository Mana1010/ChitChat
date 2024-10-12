"use client";
import React, { Dispatch, SetStateAction, useState } from "react";
import { nanoid } from "nanoid";
import { Messages, PublicMessages } from "@/types/UserTypes";
import { User } from "next-auth";
import { Socket } from "socket.io-client";

interface ReactionSchema {
  emoji: string;
  name: string;
  id: string;
}
const reactions: ReactionSchema[] = [
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
  messageDetails,
  userId,
  socket,
  setMessage,
  setOpenReaction,
}: {
  messageDetails: PublicMessages<User>;
  userId: string;
  socket: Socket | null;
  setMessage: Dispatch<SetStateAction<PublicMessages<User>[]>>;
  setOpenReaction: Dispatch<SetStateAction<string | undefined>>;
}) {
  function removeReaction(message: PublicMessages<User>) {
    const removeReaction = message.reactions.filter(
      ({ reactor }) => reactor !== userId //Filtered out or delete the reaction of a reactor when they click the same reaction again
    );
    return { ...message, reactions: removeReaction }; //Return the filtered out reaction;
  }
  function updateReaction(
    message: PublicMessages<User>,
    reaction: ReactionSchema
  ) {
    const updateReaction = message.reactions.map((messageReaction) => {
      if (messageReaction.reactor === userId) {
        return {
          ...messageReaction,
          reactionEmoji: reaction.emoji,
        };
      } else {
        return messageReaction;
      }
    });
    return { ...message, reactions: updateReaction };
  }

  function addReaction(
    message: PublicMessages<User>,
    reaction: ReactionSchema
  ) {
    return {
      ...message,
      reactions: [
        ...message.reactions,
        {
          reactor: userId,
          reactionEmoji: reaction.emoji,
          reactionCreatedAt: new Date().toString(),
        },
      ],
    };
  }
  const findReaction = messageDetails.reactions.find(
    (reaction) => reaction.reactor === userId
  );
  return (
    <div className="absolute -top-10 -left-25 rounded-md bg-[#414141] flex items-center justify-center h-[40px] z-[99999]">
      {reactions.map((reaction) => (
        <button
          onClick={() => {
            if (!socket) return;
            socket.emit("send-reaction", {
              reaction: reaction.emoji,
              messageId: messageDetails._id,
            });
            setMessage((prev): any => {
              return prev.map((message: PublicMessages<User>) => {
                if (messageDetails._id === message._id) {
                  if (findReaction?.reactionEmoji === reaction.emoji) {
                    return removeReaction(message);
                  } // When the user tried to click the same reaction, it will be removed.

                  //Checking if the user has already reacted
                  if (findReaction) {
                    return updateReaction(message, reaction); // When the user wants to update their reaction.
                  }
                  return addReaction(message, reaction); //When the user wants to react to a message for the first time
                } else {
                  return message;
                }
              });
            });
            setOpenReaction("");
          }}
          key={reaction.id}
          className={`text-2xl h-full p-1 ${
            findReaction?.reactionEmoji === reaction.emoji
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

export default PublicReactions;
