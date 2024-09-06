import React, { Children, ReactNode } from "react";

interface Routes {
  children: ReactNode;
  chatboard: ReactNode;
  chatusers: ReactNode;
}
function PrivateLayout({ chatboard, chatusers, children }: Routes) {
  return (
    <div className="space-x-3 grid grid-cols-3 h-full w-full">
      {chatusers}
      {chatboard}
    </div>
  );
}

export default PrivateLayout;
