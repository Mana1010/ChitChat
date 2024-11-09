import { Server } from "socket.io";

export const PUBLIC_NAMESPACE = (io: Server) => {
  return io.of("/");
};
export const PRIVATE_NAMESPACE = (io: Server) => {
  return io.of("/private");
};

export const NOTIFICATION_NAMESPACE = (io: Server) => {
  return io.of("/notification");
};

export const GROUP_NAMESPACE = (io: Server) => {
  return io.of("/group");
};

export const MAIL_NAMESPACE = (io: Server) => {
  return io.of("/mail");
};
