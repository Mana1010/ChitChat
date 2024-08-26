import { io } from "socket.io-client";

const URL = "http://localhost:5000";

export const socket = io(URL, {
  autoConnect: false,
  auth: { token: false },
});

export const socketPrivate = io(`${URL}/private`, {
  autoConnect: false,
});
