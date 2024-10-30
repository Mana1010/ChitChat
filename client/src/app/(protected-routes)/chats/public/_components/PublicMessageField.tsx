"use client";
import React, {
  SetStateAction,
  Dispatch,
  RefObject,
  useState,
  useRef,
  useEffect,
} from "react";
import { LuSend, LuTimer } from "react-icons/lu";
import { Socket } from "socket.io-client";
import Picker from "emoji-picker-react";
import { MdEmojiEmotions } from "react-icons/md";
import { User } from "next-auth";

interface SocketSchema {
  scrollRef: HTMLDivElement | null;
  socketRef: Socket | null;
  inputRef: RefObject<HTMLInputElement>;
}
interface PublicMessageFieldSchema extends SocketSchema {
  openEmoji: boolean;
  message: string;
  sessionData: User | undefined;
  setOpenEmoji: Dispatch<SetStateAction<boolean>>;
  sendMessage: () => void;
  setMessage: Dispatch<SetStateAction<string>>;
}
function PublicMessageField({
  openEmoji,
  message,
  sessionData,
  sendMessage,
  setOpenEmoji,
  setMessage,
  scrollRef,
  socketRef,
  inputRef,
}: PublicMessageFieldSchema) {
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    if (timer === 0) return;
    const timerInterval = setInterval(() => {
      setTimer((prevTimer) => prevTimer - 1);
    }, 1000);

    return () => clearInterval(timerInterval); //To avoid stacking the interval so lets clear the previous interval for every dependency changes
  }, [timer]);
  return (
    <form
      onSubmit={(e) => {
        if (!scrollRef) return;
        e.preventDefault();
        sendMessage(); //To send a message to database
        setTimer(3);
        setMessage("");
        setTimeout(() => {
          scrollRef.scrollIntoView({ block: "end" }); //To bypass the closure nature of react :)
        }, 0);
      }}
      className="flex-grow flex space-x-2 items-center pt-3 justify-between"
    >
      <input
        onChange={(e) => {
          setMessage(e.target.value);
        }}
        onFocus={() => {
          socketRef?.emit("during-typing", {
            userImg: sessionData?.image,
          });
        }}
        onBlur={() => {
          socketRef?.emit("stop-typing");
        }}
        ref={inputRef}
        value={
          timer > 0
            ? `Please wait ${timer} seconds before sending your next message.`
            : message
        }
        disabled={timer > 0}
        type="text"
        placeholder="Send a message"
        className="text-zinc-100 placeholder:text-zinc-300 py-3 rounded-md bg-[#3A3B3C] px-3 flex-grow disabled:bg-[#222222]/30 text-sm"
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
            theme="dark"
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
