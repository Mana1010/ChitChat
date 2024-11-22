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
    if (mailSocket && status === "authenticated") {
      mailSocket.emit("join-room", { userId: session.user.userId });
    }
    return () => {
      if (mailSocket && status === "authenticated") {
        mailSocket.emit("leave-room", { userId: session.user.userId });
      }
    };
  }, [mailSocket, session?.user.userId, setMailSocket, status]);

  return (
    <div className="space-x-3 grid grid-cols-3 h-full w-full pr-5 overflow-y-auto">
      {children}
    </div>
  );
}

export default MailProvider;
