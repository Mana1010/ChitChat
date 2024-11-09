import { Socket } from "socket.io-client";
import { create, StoreApi } from "zustand";

type SocketStore = {
  socket: Socket | null;
  mailSocket: Socket | null;
  groupMessageSocket: Socket | null;
} & {
  setPrivateSocket: (socket: Socket | null) => void;
  setMailSocket: (socket: Socket | null) => void;
  setGroupSocket: (socket: Socket | null) => void;
};
const store = (set: StoreApi<SocketStore>["setState"]) => ({
  socket: null,
  mailSocket: null,
  groupMessageSocket: null,
  setPrivateSocket: (socket: Socket | null) => {
    set({ socket });
  },
  setMailSocket: (socket: Socket | null) => {
    set({ mailSocket: socket });
  },
  setGroupSocket: (socket: Socket | null) => {
    set({ groupMessageSocket: socket });
  },
});

export const useSocketStore = create<SocketStore>(store);
