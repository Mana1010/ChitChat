"use client";
import React, { Dispatch, SetStateAction } from "react";
import { ReactionSchema } from "@/types/shared.types";
import { Message } from "@/types/shared.types";
import { User } from "next-auth";
import { Socket } from "socket.io-client";
import { reactions } from "@/utils/reactions";
import { Reaction } from "@/types/shared.types";
function PublicReactions({
  messageDetails,
  userId,
  socket,
  setMessage,
  setOpenReaction,
}: {
  messageDetails: Message<User, Reaction[]>;
  userId: string;
  socket: Socket | null;
  setMessage: Dispatch<SetStateAction<Message<User, Reaction[]>[]>>;
  setOpenReaction: Dispatch<SetStateAction<string | undefined>>;
}) {
  function removeReaction(message: Message<User, Reaction[]>) {
    const removeReaction = message.reactions?.filter(
      ({ reactor }) => reactor !== userId //Filtered out or delete the reaction of a reactor when they click the same reaction again
    );
    return { ...message, reactions: removeReaction }; //Return the filtered out reaction;
  }
  function updateReaction(
    message: Message<User, Reaction[]>,
    reaction: ReactionSchema
  ) {
    const updateReaction = message.reactions?.map((messageReaction) => {
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
    message: Message<User, Reaction[]>,
    reaction: ReactionSchema
  ) {
    return {
      ...message,
      reactions: [
        ...message?.reactions,
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
    <div className="absolute -top-10 -left-32 rounded-md bg-[#414141] flex items-center justify-center h-[40px] z-[99999]">
      {reactions.map((reaction) => (
        <button
          onClick={() => {
            if (!socket) return;
            socket.emit("send-reaction", {
              reaction: reaction.emoji,
              messageId: messageDetails._id,
              userId,
            });
            setMessage((prev): any => {
              return prev.map((message: Message<User, Reaction[]>) => {
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

export default PublicReactions;
