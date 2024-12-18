"use client";
import React, { ReactNode, useEffect } from "react";
import { initializeGroupChatSocket } from "@/utils/socket";
import { useSocketStore } from "@/utils/store/socket.store";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
function GroupChatProvider({ children }: { children: ReactNode }) {
  const { status, data: session } = useSession();
  const params = useParams();
  const { setGroupSocket, groupSocket } = useSocketStore();

  useEffect(() => {
    if (!groupSocket && status === "authenticated") {
      const socket = initializeGroupChatSocket(session.user.userId);
      setGroupSocket(socket);
      socket.on("connect", () =>
        console.log("Connected Group Socket Successfully")
      );
    }

    if (groupSocket && status === "authenticated" && params.groupId) {
      groupSocket.emit("join-room", {
        groupId: params.groupId,
        userId: session.user.userId,
      });
    }
    return () => {
      if (groupSocket && status === "authenticated" && params.groupId) {
        groupSocket.emit("leave-room", {
          groupId: params.groupId,
          userId: session.user.userId,
        });
      }
    };
  }, [
    status,
    groupSocket,
    session?.user.userId,
    setGroupSocket,
    params.groupId,
  ]);
  return (
    <div className="space-x-3 grid grid-cols-3 h-full w-full pr-5 overflow-y-auto">
      {children}
    </div>
  );
}

export default GroupChatProvider;
