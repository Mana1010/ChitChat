"use client";
import React, { useEffect } from "react";
import { AiFillMessage } from "react-icons/ai";
import Image from "next/image";
import { useSession } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MdGroups } from "react-icons/md";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { IoMegaphone } from "react-icons/io5";
import { PiMailboxFill } from "react-icons/pi";
import { usePathname } from "next/navigation";
import { useQuery, UseQueryResult, useQueryClient } from "react-query";
import axios, { AxiosError } from "axios";
import { APP_SERVER_URL } from "@/utils/serverUrl";
import { SidebarSchema } from "@/types/app.types";
import { useSocketStore } from "@/utils/store/socket.store";
import { initializeNotificationSocket } from "@/utils/socket";
function Sidebar() {
  const router = useRouter();
  const { data, status } = useSession();
  const pathname = usePathname();
  const { setNotificationSocket, notificationSocket } = useSocketStore();
  const queryClient = useQueryClient();
  const getUserStatus: UseQueryResult<
    SidebarSchema,
    AxiosError<{ message: string }>
  > = useQuery({
    queryKey: ["sidebar"],
    queryFn: async () => {
      const response = await axios.get(
        `${APP_SERVER_URL}/sidebar/${data?.user.userId}`
      );
      return response.data.message;
    },
    enabled: status === "authenticated",
    refetchOnWindowFocus: false,
    onError: (err) => {
      console.log(err);
    },
  });

  useEffect(() => {
    if (!notificationSocket && status === "authenticated") {
      const socket = initializeNotificationSocket(data.user.userId);
      setNotificationSocket(socket);
      socket.on("connect", () => {
        console.log("Notification Socket connected successfully!");
      });
      socket.emit("join-room", { userId: data?.user.userId });
      socket.on("connect_error", (error) => {
        console.error("Socket connection error:", error);
      });
    }

    return () => {
      notificationSocket?.emit("leave-room", { userId: data?.user.userId });
    };
  }, [data?.user.userId, notificationSocket, setNotificationSocket, status]);

  useEffect(() => {
    if (!notificationSocket || status === "unauthenticated") return;
    function addNotificationCount(
      sidebarKey:
        | "privateNotificationCount"
        | "groupNotificationCount"
        | "mailboxNotificationCount",
      notificationId: string
    ) {
      queryClient.setQueryData<SidebarSchema | undefined>(
        ["sidebar"],
        (cachedData) => {
          const notificationCountIds = new Set(
            cachedData?.userNotificationObj[sidebarKey]
          );
          if (cachedData) {
            if (!notificationCountIds.has(notificationId)) {
              return {
                ...cachedData,
                userNotificationObj: {
                  ...cachedData.userNotificationObj,
                  [sidebarKey]: [
                    ...cachedData.userNotificationObj[sidebarKey],
                    notificationId,
                  ],
                },
              };
            } else {
              return cachedData;
            }
          } else {
            return cachedData;
          }
        }
      );
    }
    notificationSocket.on(
      "trigger-notification",
      ({ sidebarKey, notificationId }) => {
        addNotificationCount(sidebarKey, notificationId);
      }
    );
  }, [notificationSocket, queryClient, status]);

  const navigationBtn = [
    {
      btnSticker: <IoMegaphone />,
      path: "/chats/public",
      styling: `text-[#6486FF] text-2xl p-3 rounded-md relative ${
        pathname === "/chats/public" && "bg-[#3A3B3C]"
      }`,
      newMessage: 0,
    },
    {
      btnSticker: <AiFillMessage />,
      path: `/chats/private/${
        getUserStatus.data?.userChatStatusObj?.privateConversationStatus ||
        "new"
      }?type=chats`,
      styling: `text-[#6486FF] text-2xl p-3 rounded-md relative  ${
        pathname.startsWith("/chats/private") && "bg-[#3A3B3C]"
      }`,
      newMessage:
        getUserStatus.data?.userNotificationObj.privateNotificationCount.length,
    },
    {
      btnSticker: <MdGroups />,
      path: `/chats/group/${
        getUserStatus.data?.userChatStatusObj?.groupConversationStatus
          ?.length || "new"
      }?type=chats`,
      styling: `text-[#6486FF] text-2xl p-3 rounded-md relative ${
        pathname.startsWith("/chats/group") && "bg-[#3A3B3C]"
      }`,
      newMessage:
        getUserStatus.data?.userNotificationObj.groupNotificationCount.length,
    },
    {
      btnSticker: <PiMailboxFill />,
      path: `/mailbox/mail`,
      styling: `text-[#6486FF] text-2xl p-3 rounded-md relative ${
        pathname.startsWith("/mailbox") && "bg-[#3A3B3C]"
      }`,
      newMessage:
        getUserStatus.data?.userNotificationObj.mailboxNotificationCount.length,
    },
  ];
  return (
    <div className=" flex justify-between items-center flex-col pt-4 h-full px-2 ">
      <div className="flex flex-col items-center w-full justify-center">
        {navigationBtn.map((btn, index) => (
          <div key={index}>
            <button
              onClick={() => router.push(btn.path)}
              className={btn.styling}
            >
              <span className="relative">
                {" "}
                {btn.btnSticker}
                {(btn.newMessage ?? 0) > 0 && (
                  <div className="absolute -top-2 -right-2 w-4 h-4 bg-blue-800 text-white flex items-center justify-center rounded-full">
                    <span className="text-[0.65rem]">{btn.newMessage}</span>
                  </div>
                )}
              </span>
            </button>
          </div>
        ))}
      </div>

      <div className="flex flex-col items-center w-full justify-center">
        {getUserStatus.isLoading || !data?.user ? (
          <div className="h-8 w-8 relative overflow-hidden rounded-full bg-[#414141] animate-pulse"></div>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger className="h-8 w-8 relative overflow-hidden rounded-full">
              {" "}
              <Image
                src={data?.user?.image}
                alt="profile-pic"
                sizes="100%"
                fill
                priority
                className="absolute"
              />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-[#454545] ml-2 text-white">
              <DropdownMenuItem
                onClick={() => {
                  signOut({ callbackUrl: "/login" });
                }}
                className="cursor-pointer"
              >
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
}

export default Sidebar;
