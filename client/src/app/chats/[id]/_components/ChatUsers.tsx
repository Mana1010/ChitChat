"use client";
import React from "react";
import { TbMessage } from "react-icons/tb";
import { MdManageSearch } from "react-icons/md";
function ChatUsers() {
  return (
    <div className="bg-[#222222] col-span-2 basis-[25%] rounded-md">
      <header className="w-full p-2.5 space-y-2 ">
        <div className="flex items-center space-x-2">
          <span className="text-[#6486FF] text-xl">
            <TbMessage />
          </span>
          <h3 className="text-white tracking-wide text-xl font-extrabold">
            ChitChat
          </h3>
        </div>
        <div className="w-full h-10 flex space-x-2 items-center justify-between bg-[#3A3B3C] rounded-2xl px-2">
          <span className="text-zinc-400 text-2xl">
            <MdManageSearch />
          </span>
          <input
            type="text"
            placeholder="Search your Chat"
            className="w-full rounded-2xl h-full bg-transparent outline-none caret-zinc-400 text-white"
          />
        </div>
      </header>
    </div>
  );
}

export default ChatUsers;
