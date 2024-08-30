import { Socket } from "socket.io";
import { Public } from "../model/public.model";

export function publicChat(io: Socket) {
  io.on("connection", (socket: Socket) => {
    const { userId } = socket.handshake.auth;
    socket.on("send-message", async (message: string) => {
      const getId = await Public.create({
        message,
        userId: userId,
        isMessageDeleted: false,
      });
      const getUser = await Public.findById(getId._id)
        .populate({
          path: "userId",
          select: ["-createdAt", "-updatedAt", "-__v"],
        })
        .select(["-updatedAt", "-__v"])
        .lean();
      socket.broadcast.emit("get-message", getUser);
      socket.on("send-status", (data) => {
        socket.broadcast.emit("display-status", data);
      });
    });
  });
}
