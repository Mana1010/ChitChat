"use client";
import React, { ReactNode, useEffect } from "react";
import { initializePrivateChatSocket } from "@/utils/socket";
import { useSocketStore } from "@/utils/store/socket.store";
import { useSession } from "next-auth/react";
function PrivateChatProvider({ children }: { children: ReactNode }) {
  const { status, data: session } = useSession();
  const { setSocket, socket } = useSocketStore();
  useEffect(() => {
    if (!socket && status === "authenticated") {
      const socket = initializePrivateChatSocket(session.user.userId);
      setSocket(socket);
      socket.on("connect", () => console.log("Connected Successfully"));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);
  return (
    <div className="space-x-3 grid grid-cols-3 h-full w-full">{children}</div>
  );
}

export default PrivateChatProvider;
