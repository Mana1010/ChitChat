import { Socket } from "socket.io";
import { Public } from "../model/public.model";
import { User } from "../model/user.model";

export function publicChat(io: Socket) {
  io.on("connection", async (socket: Socket) => {
    const { userId } = socket.handshake.auth;
    const typingUsers = new Map();
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
      if (!typingUsers.has(socketId) && typingUsers.size <= 10) {
        typingUsers.set(socketId, userImg);
      }
      const emittedUsers = [];
      for (const [key, value] of typingUsers) {
        //To check and filtered out
        if (key !== socketId) {
          emittedUsers.push(value);
        }
      }
      socket.emit(
        "display-during-typing",
        emittedUsers //This will retrieve the values only in Map and transformed it into an array.
      );
    });
    socket.on("stop-typing", ({ socketId }) => {
      if (typingUsers.has(socketId)) {
        typingUsers.delete(socketId);
      }
      socket.broadcast.emit("display-during-typing", new Array(typingUsers));
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
