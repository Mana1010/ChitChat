import React from "react";

function ChatBoardHeaderSkeleton() {
  return (
    <div className="flex items-center space-x-3  animate-pulse w-full">
      <div className="w-[40px] h-[40px] rounded-full bg-slate-700"></div>
      <div className="space-y-2 flex flex-col w-full">
        <div className="w-1/4 h-3 rounded-xl bg-slate-700"></div>
        <div className="w-[15%] h-3 rounded-xl bg-slate-700"></div>
      </div>
    </div>
  );
}

export default ChatBoardHeaderSkeleton;
