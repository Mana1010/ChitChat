import React, { ReactNode } from "react";

function MailProvider({ children }: { children: ReactNode }) {
  return (
    <div className="space-x-3 grid grid-cols-3 h-full w-full">{children}</div>
  );
}

export default MailProvider;
