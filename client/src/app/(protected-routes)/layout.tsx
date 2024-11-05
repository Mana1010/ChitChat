import React, { ReactNode } from "react";
import Sidebar from "./chats/_components/Sidebar";
import CreateGroupChat from "./chats/group/[groupId]/_components/CreateGroupChat";
interface Routes {
  children: ReactNode;
  chatboard: ReactNode;
  chatusers: ReactNode;
}

function ProtectedRoutesLayout({ children }: Routes) {
  return (
    <div className={`flex bg-[#171717] py-5 h-screen pr-4 relative w-full`}>
      <CreateGroupChat />
      <Sidebar />
      {children}
    </div>
  );
}

export default ProtectedRoutesLayout;
