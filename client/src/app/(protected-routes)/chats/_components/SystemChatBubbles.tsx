import React from "react";

interface SystemChatBubblesPropsSchema {
  senderName: string;
  senderId: string;
  userId: string;

  message: string;
}
function SystemChatBubbles({
  senderName,
  senderId,
  userId,
  message,
}: SystemChatBubblesPropsSchema) {
  return (
    <div className="w-full flex items-center justify-center">
      <h1 className="text-zinc-300 text-[0.8rem]">
        {`${senderId === userId ? "You" : senderName} ${message}`}
      </h1>
    </div>
  );
}

export default SystemChatBubbles;
