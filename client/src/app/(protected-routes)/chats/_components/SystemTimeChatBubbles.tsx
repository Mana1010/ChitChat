import React from "react";

function SystemTimeChatBubbles({ message }: { message: string }) {
  return (
    <div className="w-full flex items-center justify-center">
      <h1 className="text-zinc-300 text-[0.8rem]">{message}</h1>
    </div>
  );
}

export default SystemTimeChatBubbles;
