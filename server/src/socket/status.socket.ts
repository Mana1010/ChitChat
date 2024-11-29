import { Server, Socket } from "socket.io";
import { STATUS_NAMESPACE } from "../utils/namespaces.utils";
import { User } from "../model/user.model";

let timeout: NodeJS.Timeout | undefined;
export function handleStatusSocket(io: Server) {
  STATUS_NAMESPACE(io).on("connection", async (socket: Socket) => {
    console.log("Successfully joined to status connection");
    const { userId } = socket.handshake.auth;

    socket.once("user-active", async () => {
      await User.findByIdAndUpdate(userId, {
        $set: {
          status: "Online",
        },
      });
      socket.broadcast.emit("display-user-status", {
        userId,
        status: "Online",
      });
    });
    socket.once("disconnect", async () => {
      console.log("Running Disconnected");
      await User.findByIdAndUpdate(userId, {
        $set: {
          status: "Offline",
        },
      });
      socket.broadcast.emit("display-user-status", {
        userId,
        status: "Offline",
      });
    });
  });
}
