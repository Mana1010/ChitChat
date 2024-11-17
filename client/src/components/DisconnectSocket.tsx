"use client";
import React, { useEffect } from "react";
import { useSocketStore } from "@/utils/store/socket.store";

function DisconnectSocket() {
  const { privateSocket, groupSocket } = useSocketStore();

  useEffect(() => {
    return () => {
      if (privateSocket || groupSocket) {
        privateSocket?.disconnect();
        groupSocket?.disconnect();
      }
    };
  });
  return null;
}

export default DisconnectSocket;
