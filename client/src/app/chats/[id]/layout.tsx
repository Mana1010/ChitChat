import React, { ReactNode } from "react";
import Sidebar from "./_components/Sidebar";
import { AiFillMessage } from "react-icons/ai";
interface Routes {
  children: ReactNode;
  chatboard: ReactNode;
  chatusers: ReactNode;
}
function ChatLayout({ children, chatboard, chatusers }: Routes) {
  return (
    <div className="flex bg-[#171717] py-5 h-screen pr-4">
      <Sidebar />
      <div className="space-x-3 flex h-full w-full">
        {chatusers}
        {chatboard}
      </div>
      {children}
    </div>
  );
}

export default ChatLayout;
