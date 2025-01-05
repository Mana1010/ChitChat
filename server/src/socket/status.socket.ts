import { Server, Socket } from "socket.io";
import { STATUS_NAMESPACE } from "../utils/namespaces.utils";
import { User } from "../model/user.model";

let timeout: NodeJS.Timeout | undefined;

async function handleUpdateStatus(
  userId: string,
  status: "online" | "offline"
) {
  const result = (await User.findByIdAndUpdate(
    userId,
    {
      $set: {
        status: {
          type: status,
          lastActiveAt: new Date(),
        },
      },
    },
    {
      new: true,
    }
  )
    .lean()
    .select("status")) as { status: { type: string; lastActiveAt: Date } };
  return {
    status: result?.status.type,
    lastActiveAt: result?.status.lastActiveAt,
  };
}

export function handleStatusSocket(io: Server) {
  STATUS_NAMESPACE(io).on("connection", async (socket: Socket) => {
    console.log("Successfully joined to status connection");
    const { userId } = socket.handshake.auth;

    socket.once("user-active", async () => {
      const { status, lastActiveAt } = await handleUpdateStatus(
        userId,
        "online"
      );
      socket.broadcast.emit("display-user-status", {
        userId,
        status: {
          type: status,
          lastActiveAt: lastActiveAt,
        },
      });
    });
    socket.once("disconnect", async () => {
      const { status, lastActiveAt } = await handleUpdateStatus(
        userId,
        "offline"
      );

      socket.broadcast.emit("display-user-status", {
        userId,
        status: {
          type: status,
          lastActiveAt,
        },
      });
    });
  });
}
