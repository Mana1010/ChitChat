"use client";
import React, { ReactNode, useEffect } from "react";
import { initializePrivateChatSocket } from "@/utils/socket";
import { useSocketStore } from "@/utils/store/socket.store";
import { useSession } from "next-auth/react";
function PublicProvider({ children }: { children: ReactNode }) {
  const { status, data: session } = useSession();
  const { setPublicSocket, publicSocket } = useSocketStore();
  useEffect(() => {
    if (!publicSocket && status === "authenticated") {
      const socket = initializePrivateChatSocket(session.user.userId);
      setPublicSocket(socket);
      socket.on("connect", () =>
        console.log("Connected Public Chat Successfully")
      );
    }

    if (publicSocket && status === "authenticated") {
      publicSocket.emit("join-room", {
        userId: session.user.userId,
      });
    }
    return () => {
      publicSocket?.emit("leave-room", {
        userId: session?.user.userId,
      });
    };
  }, [publicSocket, session?.user.userId, setPublicSocket, status]);

  return <div className="w-full h-full">{children}</div>;
}

export default PublicProvider;
