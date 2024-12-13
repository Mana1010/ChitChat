"use client";
import React, { ReactNode, useEffect } from "react";
import { useSocketStore } from "@/utils/store/socket.store";
import { useSession } from "next-auth/react";
import { initializeStatusSocket } from "@/utils/socket";
import {
  GROUP_CHATLIST_KEY,
  PRIVATE_CHATLIST_SESSION_KEY,
  MAIL_LIST_SESSION_KEY,
  DEFAULT_SESSION_VALUE,
} from "@/utils/storageKey";
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
    sessionStorage.setItem(PRIVATE_CHATLIST_SESSION_KEY, "0");
    sessionStorage.setItem(GROUP_CHATLIST_KEY, "0");
    sessionStorage.setItem("mail_scroll_position", "0");

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
        localStorage.removeItem("chatlist_scroll_position");
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
