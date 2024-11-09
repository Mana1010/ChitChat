"use client";
import React, { ReactNode, useEffect } from "react";
import { initializeGroupChatSocket } from "@/utils/socket";
import { useSocketStore } from "@/utils/store/socket.store";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
function GroupChatProvider({ children }: { children: ReactNode }) {
  const { status, data: session } = useSession();
  const params = useParams();
  const { setGroupSocket, groupMessageSocket } = useSocketStore();

  useEffect(() => {
    if (!groupMessageSocket && status === "authenticated") {
      const socket = initializeGroupChatSocket(session.user.userId);
      setGroupSocket(socket);
      socket.on("connect", () =>
        console.log("Connected Group Socket Successfully")
      );
    }
    return () => {
      groupMessageSocket?.off("connect");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);
  return (
    <div className="space-x-3 grid grid-cols-3 h-full w-full">{children}</div>
  );
}

export default GroupChatProvider;
