import React, { ReactNode } from "react";
import Sidebar from "./_components/Sidebar";
import CreateGroupChat from "./group/[groupId]/_components/CreateGroupChat";
interface Routes {
  children: ReactNode;
  chatboard: ReactNode;
  chatusers: ReactNode;
}

function ChatLayout({ children }: Routes) {
  return (
    <div className={`flex bg-[#171717] py-5 h-screen pr-4 relative`}>
      <CreateGroupChat />
      <Sidebar />
      {children}
    </div>
  );
}

export default ChatLayout;
