import React, { Dispatch, SetStateAction } from "react";
import Picker from "emoji-picker-react";
import { MdEmojiEmotions } from "react-icons/md";
import { LuSend } from "react-icons/lu";
import { Socket } from "socket.io-client";
import { GetParticipantInfo } from "@/types/UserTypes";
interface MessageFieldProps {
  socket: Socket | null;
  participantInfo?: GetParticipantInfo;
  conversationId: string;
  message: string;
  openEmoji: boolean;
  sendMessage: (messageContent: string) => void;
  updateChatList: (userMessage: string) => void;
  setMessage: Dispatch<SetStateAction<string>>;
  setOpenEmoji: Dispatch<SetStateAction<boolean>>;
}
function MessageField({
  socket,
  participantInfo,
  conversationId,
  message,
  openEmoji,
  updateChatList,
  sendMessage,
  setMessage,
  setOpenEmoji,
}: MessageFieldProps) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!socket) return;
        socket.emit(
          "send-message",
          {
            message,
            messageType: "text",
            conversationId,
            receiverId: participantInfo?.receiver_details._id,
          },
          (cb: { success: boolean }) => {
            if (cb.success) {
              alert("Your message successfully delivered!");
            }
          }
        );
        sendMessage(message);
        updateChatList(message);
        setMessage("");
      }}
      className="px-3 py-2.5 flex items-center space-x-2 bg-[#171717]"
    >
      <input
        onFocus={() => {
          socket?.emit("read-message", {
            conversationId,
            participantId: participantInfo?.receiver_details._id,
          });
          socket?.emit("during-typing");
        }}
        onBlur={() => socket?.emit("stop-typing")}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        type="text"
        placeholder="Send a message"
        className="rounded-md bg-[#414141] flex-grow px-3 py-2.5 text-white"
      />
      <div className="relative">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setOpenEmoji((prev: boolean) => !prev);
          }}
          className={`px-3 flex py-3 rounded-md items-center text-[#6486FF] text-xl ${
            openEmoji ? "bg-[#6486FF]/20" : "bg-[#3A3B3C]"
          }`}
        >
          <MdEmojiEmotions />
        </button>
        <div
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
            }}
            onEmojiClick={(emoji) => {
              setMessage((prev: string) => `${prev}${emoji.emoji}`);
            }}
            open={openEmoji}
            theme="dark"
          />
        </div>
      </div>
      <button
        type="submit"
        disabled={!message.trim()}
        className="px-5 flex space-x-2 bg-[#6486FF] py-2.5 rounded-md items-center text-zinc-200 disabled:bg-slate-700 disabled:text-zinc-400"
      >
        <span>
          <LuSend />
        </span>
        <span className="font-bold">Send</span>
      </button>
    </form>
  );
}

export default MessageField;
