import React from "react";

function ConversationListSkeleton() {
  return (
    <div className="pt-2 flex space-y-3 flex-col w-full overflow-y-auto h-full items-center px-3 flex-grow">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="flex items-center space-x-3 animate-pulse w-full py-1.5" //Parent Div
        >
          {/* Image Skeleton */}
          <div className="w-[40px] h-[40px] rounded-full bg-slate-700"></div>
          {/* Text Div Skeleton */}
          <div className="space-y-2 flex flex-col w-full">
            <div className="w-1/2 h-3 rounded-xl bg-slate-700"></div>
            <div className="w-1/3 h-3 rounded-xl bg-slate-700"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default ConversationListSkeleton;
