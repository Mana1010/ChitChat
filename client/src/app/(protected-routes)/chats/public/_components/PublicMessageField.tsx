import React, { useState, useEffect, FormEvent } from "react";
import { LuSend, LuTimer } from "react-icons/lu";
import { Socket } from "socket.io-client";
import Picker, { Theme } from "emoji-picker-react";
import { MdEmojiEmotions } from "react-icons/md";
import { optimisticUpdateMessage } from "@/utils/sharedUpdateFunction";
import { MessageFieldPropsSchema } from "@/types/shared.types";
import { toast } from "sonner";
import { MAX_TEXT_LENGTH } from "@/utils/constants";

type PublicMessageFieldSchema = MessageFieldPropsSchema & {
  publicSocket: Socket | null;
};

function PublicMessageField({
  publicSocket,
  openEmoji,
  message,
  session,
  setAllMessages,
  setOpenEmoji,
  setMessage,
  scrollRef,
}: PublicMessageFieldSchema) {
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    if (timer === 0) return;
    const timerInterval = setInterval(() => {
      setTimer((prevTimer) => prevTimer - 1);
    }, 1000);

    return () => clearInterval(timerInterval); //To avoid stacking the interval so lets clear the previous interval for every dependency changes
  }, [timer]);

  const handleFormSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!publicSocket || !scrollRef) return;
    publicSocket.emit(
      "send-message",
      message,
      (response: { success: boolean; data: string }) => {
        if (response.success) {
          optimisticUpdateMessage(
            message,
            setAllMessages,
            session,
            [],
            response.data
          );
        } else {
          toast.error("Cannot send a message, please try again");
        }
      }
    );

    setTimer(3);
    setMessage("");
    setTimeout(() => {
      scrollRef.scrollIntoView({ block: "end" }); //To bypass the closure nature of react :)
    }, 0);
  };

  return (
    <form
      onSubmit={handleFormSubmit}
      className=" flex space-x-2 items-center pt-2 justify-between"
    >
      <textarea
        onChange={(e) => {
          if (e.target.value.length >= MAX_TEXT_LENGTH) {
            setMessage(e.target.value.slice(0, MAX_TEXT_LENGTH));
          } else {
            setMessage(e.target.value);
          }
        }}
        onFocus={() => {
          publicSocket?.emit("during-typing", {
            userImg: session?.user.image,
          });
        }}
        onBlur={() => {
          publicSocket?.emit("stop-typing");
        }}
        value={
          timer > 0
            ? `Please wait ${timer} seconds before sending your next message.`
            : message
        }
        rows={1}
        disabled={timer > 0}
        placeholder="Send a message"
        className="text-zinc-100 placeholder:text-zinc-300 py-3 rounded-md bg-[#3A3B3C] px-3 flex-grow disabled:bg-[#222222]/30 text-sm resize-none"
      />
      {/* For Emoji */}
      <div className="relative">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setOpenEmoji((prev) => !prev);
          }}
          className={`px-4 flex  py-3.5 rounded-md items-center text-[#6486FF] text-xl ${
            openEmoji ? "bg-[#6486FF]/20" : "bg-[#3A3B3C]"
          }`}
        >
          <MdEmojiEmotions />
        </button>
        <div
          className="text-sm"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <Picker
            style={{
              position: "absolute",
              bottom: "52px",
              right: "0",
              zIndex: "100000",
              fontSize: "0.875rem",
            }}
            onEmojiClick={(emoji) => {
              setMessage((prev) => `${prev}${emoji.emoji}`);
            }}
            open={openEmoji}
            theme={Theme.DARK}
          />
        </div>
      </div>
      {/* End For Emoji */}
      <button
        type="submit"
        disabled={!message.trim()}
        className="px-5 flex space-x-2 bg-[#6486FF] py-3 text-sm rounded-md items-center text-zinc-200 disabled:bg-slate-700 disabled:text-zinc-400"
      >
        <span>{timer > 0 ? <LuTimer /> : <LuSend />}</span>
        <span className="font-bold">{timer > 0 ? `${timer}` : "Send"}</span>
      </button>
    </form>
  );
}

export default PublicMessageField;
