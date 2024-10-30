import React, { Children, ReactNode } from "react";
import PrivateChatProvider from "@/context/PrivateChatProvider";
interface Routes {
  children: ReactNode;
  chatboard: ReactNode;
  chatusers: ReactNode;
}
function PrivateLayout({ chatboard, chatusers, children }: Routes) {
  return (
    <PrivateChatProvider>
      {chatusers}
      {chatboard}
      {children}
    </PrivateChatProvider>
  );
}

export default PrivateLayout;
