import React, { ReactNode } from "react";
import Sidebar from "./chats/_components/Sidebar";
import CreateGroupChat from "./chats/group/[groupId]/_components/CreateGroupChat";
import StatusProvider from "@/context/StatusProvider";
interface Routes {
  children: ReactNode;
  chatboard: ReactNode;
  chatusers: ReactNode;
}

function ProtectedRoutesLayout({ children }: Routes) {
  return (
    <StatusProvider>
      <CreateGroupChat />
      <Sidebar />
      {children}
    </StatusProvider>
  );
}

export default ProtectedRoutesLayout;
