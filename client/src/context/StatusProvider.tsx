"use client";
import React, { ReactNode, useEffect } from "react";
import { useSocketStore } from "@/utils/store/socket.store";
import { useSession } from "next-auth/react";
import { initializeStatusSocket } from "@/utils/socket";
function StatusProvider({ children }: { children: ReactNode }) {
  const { data, status } = useSession();
  const {
    statusSocket,
    groupSocket,
    publicSocket,
    privateSocket,
    mailSocket,
    notificationSocket,
    setStatusSocket,
  } = useSocketStore();
  useEffect(() => {
    if (!statusSocket && status === "authenticated") {
      const socket = initializeStatusSocket(data.user.userId);
      setStatusSocket(socket);
      socket.emit("user-active");
      socket.on("connect", () => {
        console.log("Connected status socket successfully!!");
      });
    }
    return () => {
      if (status === "authenticated" && statusSocket) {
        statusSocket.disconnect();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.user.userId, setStatusSocket, status, statusSocket]);

  return (
    <div className={`flex bg-[#171717] h-screen relative w-full py-5`}>
      {children}
    </div>
  );
}

export default StatusProvider;
