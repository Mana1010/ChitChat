"use client";
import React, { ReactNode, useEffect } from "react";
import { initializePrivateChatSocket } from "@/utils/socket";
import { useSocketStore } from "@/utils/store/socket.store";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
function PrivateChatProvider({ children }: { children: ReactNode }) {
  const { status, data: session } = useSession();
  const { setPrivateSocket, socket } = useSocketStore();
  const { conversationId } = useParams();
  useEffect(() => {
    if (!socket && status === "authenticated") {
      const socket = initializePrivateChatSocket(session.user.userId);
      setPrivateSocket(socket);
      socket.on("connect", () =>
        console.log("Connected Private Chat Successfully")
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);
  return (
    <div className="space-x-3 grid grid-cols-3 h-full w-full pr-5 overflow-y-auto">
      {children}
    </div>
  );
}

export default PrivateChatProvider;
