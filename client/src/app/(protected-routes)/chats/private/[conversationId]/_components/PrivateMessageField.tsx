import React, { Dispatch, FormEvent, SetStateAction } from "react";
import Picker, { Theme } from "emoji-picker-react";
import { MdEmojiEmotions } from "react-icons/md";
import { LuSend } from "react-icons/lu";
import { Socket } from "socket.io-client";
import {
  handleNotificationDecrement,
  handleSeenUpdate,
  handleUnreadMessageSign,
} from "@/utils/sharedUpdateFunction";
import { GrAttachment } from "react-icons/gr";
import { useQueryClient } from "react-query";
import { updateConversationList } from "@/utils/sharedUpdateFunction";
import { MessageFieldPropsSchema } from "@/types/shared.types";
import { optimisticUpdateMessage } from "@/utils/sharedUpdateFunction";
import { toast } from "sonner";
import { MAX_TEXT_LENGTH } from "@/utils/constants";
interface PrivateMessageFieldSchema extends MessageFieldPropsSchema {
  privateSocket: Socket | null;
  participantId: string | undefined;
  conversationId: string;
  senderId: string | undefined;
  setOpenAttachmentModal: Dispatch<SetStateAction<boolean>>;
}
function PrivateMessageField({
  privateSocket,
  participantId,
  conversationId,
  message,
  openEmoji,
  senderId,
  scrollRef,
  session,
  setAllMessages,
  setMessage,
  setOpenEmoji,
  setOpenAttachmentModal,
}: PrivateMessageFieldSchema) {
  const queryClient = useQueryClient();

  const handleFormSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!privateSocket) return;
    privateSocket.emit(
      "send-message",
      {
        message,
        messageType: "text",
        conversationId,
        participantId,
      },
      (response: { success: boolean; data: string }) => {
        if (response.success) {
          optimisticUpdateMessage(
            message,
            setAllMessages,
            session,
            "",
            response.data
          );
          updateConversationList(
            queryClient,
            message,
            conversationId,
            senderId,
            "text",
            "chat-list",
            true,
            new Date(),
            { _id: senderId as string }
          );
        } else {
          toast.error("Cannot send a message, please try again");
        }
      }
    );

    privateSocket?.emit("stop-typing", conversationId);
    setTimeout(() => {
      scrollRef?.scrollIntoView({ block: "end" }); //To bypass the closure nature of react :)
    }, 0);
    handleSeenUpdate(queryClient, ["participant-info", conversationId], false);
    setMessage("");
    queryClient.invalidateQueries(["sidebar"]);
  };

  return (
    <form
      onSubmit={handleFormSubmit}
      className="py-2.5 flex items-center space-x-2 bg-[#171717]"
    >
      <textarea
        onFocus={() => {
          privateSocket?.emit("read-message", {
            conversationId,
            participantId,
          });
          privateSocket?.emit("during-typing", conversationId);
          handleNotificationDecrement(
            queryClient,
            "totalUnreadPrivateConversation",
            conversationId
          );
          handleUnreadMessageSign(queryClient, conversationId, true); //This will update the conversation read sign
        }}
        rows={1}
        onBlur={() => privateSocket?.emit("stop-typing", conversationId)}
        value={message}
        onChange={(e) => {
          if (e.target.value.length >= MAX_TEXT_LENGTH) {
            setMessage(e.target.value.slice(0, MAX_TEXT_LENGTH));
          } else {
            setMessage(e.target.value);
          }
        }}
        placeholder="Send a message"
        className="rounded-md bg-[#414141] flex-grow px-3 py-2.5 text-white resize-none"
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
            theme={Theme.DARK}
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
        <span className="font-bold hidden md:block">Send</span>
      </button>
    </form>
  );
}

export default PrivateMessageField;
