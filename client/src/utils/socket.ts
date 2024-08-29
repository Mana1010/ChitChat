// import { io } from "socket.io-client";

// const URL = "http://localhost:5000";

// export const socket = io(URL, {
//   autoConnect: false,
//   // auth: { token: false, userId:  },
// });

// export const socketPrivate = io(`${URL}/private`, {
//   autoConnect: false,
// });

import { User } from "@/types/next-auth";
import { io, Socket } from "socket.io-client";

const URL = "http://localhost:5000";

export const initializeSocket = (data: User): Socket => {
  return io(URL, {
    auth: { data },
  });
};

// export const initializePrivateSocket = (userId: string): Socket => {
//   return io(`${URL}/private`, {
//     autoConnect: false,
//     auth: {
//       userId,
//     },
//   });
// };
