import React from "react";
import PublicChat from "./_components/PublicChat";
import { TbMessages } from "react-icons/tb";

async function Page() {
  return (
    <div className="p-5 flex flex-col w-full space-y-2">
      <header>
        <div className="flex flex-col">
          <div className="flex items-center space-x-2">
            <span className="text-[#6486FF] text-xl">
              <TbMessages />
            </span>
            <h3 className="text-white tracking-wide text-xl font-semibold">
              ChitChat
            </h3>
          </div>
          <small className=" font-bold text-[#6486FF] text-sm">
            PUBLIC CHAT
          </small>
        </div>
      </header>

      <PublicChat />
    </div>
  );
}

export default Page;
