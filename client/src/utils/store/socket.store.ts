import { Socket } from "socket.io-client";
import { create, StoreApi } from "zustand";

type SocketStore = {
  publicSocket: Socket | null;
  privateSocket: Socket | null;
  groupSocket: Socket | null;
  mailSocket: Socket | null;
  notificationSocket: Socket | null;
  statusSocket: Socket | null;
} & {
  setPublicSocket: (socket: Socket | null) => void;
  setPrivateSocket: (socket: Socket | null) => void;
  setGroupSocket: (socket: Socket | null) => void;
  setMailSocket: (socket: Socket | null) => void;
  setNoficationSocket: (socket: Socket | null) => void;
  setStatusSocket: (socket: Socket | null) => void;
};
const store = (set: StoreApi<SocketStore>["setState"]) => ({
  publicSocket: null,
  privateSocket: null,
  mailSocket: null,
  groupSocket: null,
  notificationSocket: null,
  statusSocket: null,
  setPublicSocket: (socket: Socket | null) => {
    set({ publicSocket: socket });
  },
  setPrivateSocket: (socket: Socket | null) => {
    set({ privateSocket: socket });
  },
  setGroupSocket: (socket: Socket | null) => {
    set({ groupSocket: socket });
  },
  setMailSocket: (socket: Socket | null) => {
    set({ mailSocket: socket });
  },
  setNoficationSocket: (socket: Socket | null) => {
    set({ notificationSocket: socket });
  },
  setStatusSocket: (socket: Socket | null) => {
    set({ statusSocket: socket });
  },
});

export const useSocketStore = create<SocketStore>(store);
