import React, { Children, ReactNode } from "react";
import PrivateChatProvider from "@/context/PrivateChatProvider";
interface Routes {
  children: ReactNode;
  chatboard: ReactNode;
  chatgroups: ReactNode;
}
function GroupLayout({ chatboard, chatgroups, children }: Routes) {
  return (
    <div className="space-x-3 grid grid-cols-3 h-full w-full">
      {chatgroups}
      {chatboard}
      {children}
    </div>
  );
}

export default GroupLayout;
