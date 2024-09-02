import React, { ReactNode } from "react";

interface Routes {
  children: ReactNode;
  chatboard: ReactNode;
  chatusers: ReactNode;
}
function PrivateLayout({ chatboard, chatusers }: Routes) {
  return (
    <div className="space-x-3 flex h-full w-full">
      {chatusers}
      {chatboard}
    </div>
  );
}

export default PrivateLayout;