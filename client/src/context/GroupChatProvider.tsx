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

    if (groupMessageSocket && status === "authenticated") {
      groupMessageSocket.emit("join-room", {
        groupId: params.groupId,
        memberId: session.user.userId,
      });
    }
    return () => {
      if (groupMessageSocket && status === "authenticated") {
        groupMessageSocket.off("connect");
        groupMessageSocket.emit("leave-room", {
          groupId: params.groupId,
          memberId: session.user.userId,
        });
      }
    };
  }, [
    status,
    groupMessageSocket,
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
