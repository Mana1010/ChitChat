import React, { Children, ReactNode } from "react";
import GroupChatProvider from "@/context/GroupChatProvider";

interface Routes {
  children: ReactNode;
  chatboard: ReactNode;
  chatgroups: ReactNode;
}
function GroupLayout({ chatboard, chatgroups, children }: Routes) {
  return (
    <GroupChatProvider>
      {chatgroups}
      {chatboard}
      {children}
    </GroupChatProvider>
  );
}

export default GroupLayout;
