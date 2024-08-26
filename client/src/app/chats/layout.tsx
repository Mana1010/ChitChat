import React, { ReactNode } from "react";
import Sidebar from "./_components/Sidebar";
interface Routes {
  children: ReactNode;
  chatboard: ReactNode;
  chatusers: ReactNode;
}
function ChatLayout({ children }: Routes) {
  return (
    <div className="flex bg-[#171717] py-5 h-screen pr-4">
      <Sidebar />
      {children}
    </div>
  );
}

export default ChatLayout;
