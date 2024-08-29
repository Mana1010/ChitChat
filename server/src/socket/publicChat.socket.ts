import { Socket } from "socket.io";
import { Public } from "../model/public.model";

export function publicChat(io: Socket) {
  io.on("connection", (socket: Socket) => {
    console.log("Connected");
    const data = socket.handshake.auth.data;
    socket.on("send-message", async (message: string) => {
      const getId = await Public.create({
        message,
        userId: data.userId,
        isMessageDeleted: false,
      });

      const updatedData = {
        message,
        userId: {
          name: data?.name,
          email: data?.email,
          messageId: getId._id,
          _id: data.userId,
          authId: data?.id,
          profilePic: data?.image,
          provider: data?.provider,
        },
        isMessageDeleted: false,
      };
      console.log(updatedData);
      socket.broadcast.emit("get-message", updatedData);
    });
  });
}
