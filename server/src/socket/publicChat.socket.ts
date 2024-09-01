import { Socket } from "socket.io";
import { Public } from "../model/public.model";
import { User } from "../model/user.model";

export function publicChat(io: Socket) {
  let typingUsers: { socketId: string; userImg: string }[] = [];
  io.on("connection", async (socket: Socket) => {
    const { userId } = socket.handshake.auth;

    const getInfo = await User.findById(userId).select(["name", "status"]);
    if (getInfo.status === "Offline") {
      getInfo.status = "Online";
      await getInfo.save();
      socket.broadcast.emit("display-status", {
        status: getInfo.status,
        name: getInfo.name,
      });
    }
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
    socket.on("during-typing", ({ userImg, socketId }) => {
      const checkSocketId = typingUsers.some(
        (typeUser) => typeUser.socketId === socketId
      );
      if (!checkSocketId && typingUsers.length < 10) {
        typingUsers.push({ socketId, userImg });
      }
      socket.broadcast.emit(
        "display-during-typing",
        typingUsers //This will retrieve the values only in Map and transformed it into an array.
      );
    });
    socket.on("stop-typing", ({ socketId }) => {
      typingUsers.splice(
        typingUsers.findIndex((user) => user.socketId === socketId),
        1
      );
      console.log(typingUsers);
      socket.broadcast.emit("display-during-typing", typingUsers);
    });
    socket.on("disconnect", async () => {
      const disconnectUser = await User.findById(userId).select([
        "name",
        "status",
      ]);
      console.log("User is disconnected");
      if (disconnectUser === "Online") {
        console.log("User is disco-nnected");
        disconnectUser.status = "Offline";
        await disconnectUser.save();
        socket.broadcast.emit("display-status", {
          status: disconnectUser.status,
          name: disconnectUser.name,
        });
      }
    });
  });
}
