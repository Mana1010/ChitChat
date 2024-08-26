import { Socket } from "socket.io";
import { Public } from "../model/public.model";
export function publicChat(io: Socket) {
  io.on("connection", (socket: Socket) => {
    socket.on("send-message", async (message: string) => {
      await Public.create({
        message,
        userId: socket.handshake.auth.userDbId,
      });
      socket.broadcast.emit("get-message", message);
    });
  });
}
