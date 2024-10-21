"use client";
import React, { useState } from "react";
import { TbMessage } from "react-icons/tb";
import { MdManageSearch } from "react-icons/md";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import ChatList from "./ChatList";
import GroupList from "./GroupList";
import useDebounce from "@/hooks/useDebounce.hook";
import useSearchUser from "@/hooks/useSearchUser.hook";
function ChatGroups({ groupId }: { groupId: string }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const type = searchParams.get("type");
  const [search, setSearch] = useState<string>("");

  return (
    <div className="bg-[#222222] h-full rounded-md flex flex-col">
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
            onChange={(e) => setSearch(e.target.value)}
            value={search}
            type="text"
            placeholder={`Search ${
              type === "chats" ? "your Group Chat" : "New Group Chat"
            }`}
            className="w-full rounded-2xl h-full bg-transparent outline-none caret-zinc-400 text-white"
          />
        </div>
      </header>
      <div className="p-2 flex items-center w-full justify-between">
        <button
          onClick={() => router.push(`${pathname}?type=chats`)}
          className={`px-3 py-1.5 hover:bg-[#3A3B3C] text-[#6486FF] rounded-lg w-1/2 transition ease-in duration-100 ${
            type === "chats" && "bg-[#3A3B3C]"
          }`}
        >
          Chats
        </button>
        <button
          onClick={() => router.push(`${pathname}?type=users`)}
          className={`px-3 py-1.5 hover:bg-[#3A3B3C] text-[#6486FF] rounded-lg w-1/2 transition ease-in duration-100 ${
            type === "users" && "bg-[#3A3B3C]"
          }`}
        >
          Groups
        </button>
      </div>
      {type === "chats" ? (
        <ChatList searchChat={search} groupId={groupId} />
      ) : (
        <GroupList searchUser={search} />
      )}
    </div>
  );
}

export default ChatGroups;
