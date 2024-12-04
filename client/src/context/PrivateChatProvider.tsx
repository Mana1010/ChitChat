"use client";
import React, { ReactNode, useEffect } from "react";
import { initializePrivateChatSocket } from "@/utils/socket";
import { useSocketStore } from "@/utils/store/socket.store";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
function PrivateChatProvider({ children }: { children: ReactNode }) {
  const { status, data: session } = useSession();
  const { setPrivateSocket, privateSocket } = useSocketStore();
  const { conversationId } = useParams();
  useEffect(() => {
    if (!privateSocket && status === "authenticated") {
      const socket = initializePrivateChatSocket(session.user.userId);
      setPrivateSocket(socket);
      socket.on("connect", () =>
        console.log("Connected Private Chat Successfully")
      );
    }

    if (privateSocket && status === "authenticated") {
      privateSocket.emit("join-room", {
        conversationId,
        userId: session.user.userId,
      });
    }
    return () => {
      privateSocket?.emit("leave-room", {
        conversationId,
        userId: session?.user.userId,
      });
    };
  }, [
    conversationId,
    privateSocket,
    session?.user.userId,
    setPrivateSocket,
    status,
  ]);

  return (
    <div className="space-x-3 grid grid-cols-3 w-full pr-5 overflow-y-auto h-full">
      {children}
    </div>
  );
}

export default PrivateChatProvider;
