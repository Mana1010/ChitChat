import { Server } from "socket.io";
import { User } from "../model/user.model";
import { Invitation } from "../model/mail.model";

type RequestedUsers = { id: string; name: string };
export async function groupChat(io: Server) {
  const groupSocket = io.of("/group");
  groupSocket.on("connection", (socket) => {
    const { userId } = socket.handshake.auth;
    socket.on(
      "send-request",
      async ({
        requestedUsers,
        groupId,
      }: {
        requestedUsers: RequestedUsers[];
        groupId: string;
      }) => {
        if (!requestedUsers || !groupId) return;
        await Promise.all(
          requestedUsers.map(async (requestedUser: RequestedUsers) => {
            // await User.findByIdAndUpdate(requestedUser.id, {
            //   $push: {
            //     mail: {
            //       from: userId,
            //       body: groupId,
            //       type: "invitation",
            //     },
            //   },
            // });
            await Invitation.create({
              to: requestedUser.id,
              from: userId,
              body: groupId,
              type: "invitation",
            });
          })
        );
      }
    );
  });
}
