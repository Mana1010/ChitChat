import { Socket } from "socket.io-client";
import { create, StoreApi } from "zustand";

type SocketStore = { socket: Socket | null } & {
  setSocket: (socket: Socket | null) => void;
};
const store = (set: StoreApi<SocketStore>["setState"]) => ({
  socket: null,
  setSocket: (socket: Socket | null) => {
    set({ socket });
  },
});

export const useSocketStore = create<SocketStore>(store);
