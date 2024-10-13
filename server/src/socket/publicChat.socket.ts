import { Socket } from "socket.io";
import { Public } from "../model/public.model";
import { User } from "../model/user.model";
import mongoose from "mongoose";

function stopTyping(
  socket: Socket,
  typingUsers: { socketId: string; userImg: string }[]
) {
  socket.on("stop-typing", ({ socketId }) => {
    const findIndex = typingUsers.findIndex(
      (user) => user.socketId === socketId
    );
    if (findIndex !== -1) {
      typingUsers.splice(findIndex, 1);
    }
    socket.broadcast.emit("display-during-typing", typingUsers);
  });
}
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
        sender: userId,
        isMessageDeleted: false,
      });
      const getUser = await Public.findById(getId._id) //Retrieving the Public messages
        .populate({
          path: "sender",
          select: ["name", "profilePic", "status"],
        })
        .select(["-updatedAt", "-__v"])
        .lean();
      socket.broadcast.emit("get-message", getUser);
      socket.on("send-status", (data) => {
        socket.broadcast.emit("display-status", data);
      });
    });
    socket.on("send-reaction", async ({ reaction, messageId }) => {
      if (!reaction || !messageId || !userId) return; //To ensure that those fields is not empty
      const findMessageAndCheckUserReaction = await Public.aggregate([
        {
          $match: { _id: new mongoose.Types.ObjectId(messageId) },
        },
        {
          $unwind: "$reactions",
        },
        {
          $match: { "reactions.reactor": new mongoose.Types.ObjectId(userId) },
        },
        {
          $project: {
            reactions: 1,
          },
        },
      ]);

      if (findMessageAndCheckUserReaction.length !== 0) {
        //If the user already reacted
        if (
          findMessageAndCheckUserReaction[0].reactions.reactionEmoji ===
          reaction
        ) {
          await Public.findByIdAndUpdate(messageId, {
            $pull: {
              reactions: {
                reactor: userId,
              },
            },
          });
        } else {
          await Public.updateOne(
            { _id: messageId, "reactions.reactor": userId },
            { $set: { "reactions.$.reactionEmoji": reaction } } //The $ sign is to check the very first match element then update its reaction
          );
        }
      } else {
        await Public.findByIdAndUpdate(messageId, {
          $push: {
            reactions: {
              reactor: userId,
              reactionEmoji: reaction,
            },
          },
        });
      }
      const getChangedReaction = await Public.findById(messageId).select([
        "reactions",
        "-_id",
      ]);
      console.log(getChangedReaction);
      socket.broadcast.emit("display-reaction", { data: getChangedReaction });
    });
    socket.on("during-typing", ({ userImg, socketId }) => {
      const checkSocketId = typingUsers.some(
        (typeUser) => typeUser.socketId === socketId
      );
      if (!checkSocketId && typingUsers.length < 10) {
        typingUsers.push({ socketId, userImg });
      }
      socket.broadcast.emit("display-during-typing", typingUsers);
    });
    stopTyping(socket, typingUsers);

    socket.on("user-disconnect", async () => {
      const disconnectUser = await User.findById(userId).select([
        "name",
        "status",
      ]);
      if (disconnectUser === "Online") {
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
