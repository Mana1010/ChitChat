import { Socket } from "socket.io";
import { Public } from "../model/public.model";

export function messageSocket(io: Socket) {
  io.on("connection", (socket: Socket) => {
    const data = socket.handshake.auth.data;
    socket.on("send-message", async (message) => {
      const id = await Public.create({ message, userId: data.userId });
      socket.emit("get-message", {
        message,
        data: { ...data },
        isMessageDeleted: false,
        _id: id._id,
      });
    });
  });
}
