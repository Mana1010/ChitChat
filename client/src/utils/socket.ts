import { io, Socket } from "socket.io-client";

// const URL = "http://localhost:5000";
const URL = "https://chitchat-g4qv.onrender.com";

export const initializePublicChatSocket = (userId: string): Socket => {
  return io(URL, {
    withCredentials: true,
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
  return io(`${URL}/notification`, {
    auth: {
      userId,
    },
  });
};
export const initializeGroupChatSocket = (userId: string): Socket => {
  return io(`${URL}/group`, {
    auth: {
      userId,
    },
  });
};

export const initializeMailSocket = (userId: string): Socket => {
  return io(`${URL}/mail`, {
    auth: {
      userId,
    },
  });
};
export const initializeStatusSocket = (userId: string): Socket => {
  return io(`${URL}/status`, {
    auth: {
      userId,
    },
  });
};
