import { io, Socket } from "socket.io-client";

const URL = "http://localhost:5000";

export const initializePublicChatSocket = (userId: string): Socket => {
  return io(URL, {
    auth: { userId },
  });
};

export const initializePrivateChatSocket = (userId: string): Socket => {
  return io(`${URL}/private`, {
    auth: {
      userId,
    },
  });
};
export const initializeNotificationSocket = (userId: string): Socket => {
  return io(`${URL}/group`, {
    autoConnect: false,
    auth: {
      userId,
    },
  });
};
