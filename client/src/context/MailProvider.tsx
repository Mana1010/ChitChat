"use client";
import React, { ReactNode, useEffect } from "react";
import { useSocketStore } from "@/utils/store/socket.store";
import { initializeMailSocket } from "@/utils/socket";
import { useSession } from "next-auth/react";
function MailProvider({ children }: { children: ReactNode }) {
  const { setMailSocket, mailSocket } = useSocketStore();
  const { data: session, status } = useSession();
  useEffect(() => {
    if (status === "authenticated" && !mailSocket) {
      const socket = initializeMailSocket(session.user.userId);
      setMailSocket(socket);
      socket.on("connect", () =>
        console.log("Mail Socket Connected Successfully")
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);
  return (
    <div className="space-x-3 grid grid-cols-3 h-full w-full">{children}</div>
  );
}

export default MailProvider;
