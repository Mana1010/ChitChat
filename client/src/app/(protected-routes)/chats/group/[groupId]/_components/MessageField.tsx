import React, { Dispatch, SetStateAction } from "react";
import Picker from "emoji-picker-react";
import { MdEmojiEmotions } from "react-icons/md";
import { LuSend } from "react-icons/lu";
import { Socket } from "socket.io-client";
import { updateConversationList } from "@/utils/updater.conversation.utils";
import { GrAttachment } from "react-icons/gr";
import { useQueryClient } from "react-query";
interface MessageFieldProps {
  socket: Socket | null;
  groupId: string;
  senderId: string | undefined;
  message: string;
  openEmoji: boolean;
  sendMessage: (messageContent: string) => void;
  setMessage: Dispatch<SetStateAction<string>>;
  setOpenEmoji: Dispatch<SetStateAction<boolean>>;
  setOpenAttachmentModal: Dispatch<SetStateAction<boolean>>;
}
function MessageField({
  socket,
  groupId,
  senderId,
  message,
  openEmoji,
  sendMessage,
  setMessage,
  setOpenEmoji,
  setOpenAttachmentModal,
}: MessageFieldProps) {
  const queryClient = useQueryClient();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!socket) return;
        socket.emit(
          "send-message",
          {
            message,
            groupId,
          },
          (cb: { success: boolean }) => {
            if (cb.success) {
              alert("Your message successfully delivered!");
            }
          }
        );
        sendMessage(message);
        updateConversationList(
          queryClient,
          message,
          groupId,
          senderId,
          "text",
          "groupchat-list",
          false
        );
        setMessage("");
      }}
      className="px-3 py-2.5 flex items-center space-x-2 bg-[#171717]"
    >
      <input
        onFocus={() => {
          socket?.emit("read-message", { groupId });
          socket?.emit("during-typing", { groupId });
        }}
        onBlur={() => socket?.emit("stop-typing", groupId)}
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
        onClick={(e) => {
          e.stopPropagation();
          setOpenAttachmentModal((prev) => !prev);
        }}
        type="button"
        className={`px-3 flex py-3 rounded-md items-center text-[#6486FF] text-xl bg-[#3A3B3C]`}
      >
        <GrAttachment />
      </button>
      <button
        type="submit"
        disabled={!message.trim()}
        className="px-5 flex space-x-2 bg-[#6486FF] py-3.5 md:py-2.5 rounded-md items-center text-zinc-200 disabled:bg-slate-700 disabled:text-zinc-400"
      >
        <span>
          <LuSend />
        </span>
        <span className="font-bold hidden md:block">Send</span>
      </button>
    </form>
  );
}

export default MessageField;
