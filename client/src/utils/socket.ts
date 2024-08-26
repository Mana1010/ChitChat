// import { io } from "socket.io-client";

// const URL = "http://localhost:5000";

// export const socket = io(URL, {
//   autoConnect: false,
//   // auth: { token: false, userId:  },
// });

// export const socketPrivate = io(`${URL}/private`, {
//   autoConnect: false,
// });

import { io, Socket } from "socket.io-client";

const URL = "http://localhost:5000";

export const initializeSocket = (
  userId: string,
  status: string,
  userDbId: string
): Socket => {
  return io(URL, {
    autoConnect: true,
    auth: {
      userId,
      status,
      userDbId,
    },
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
