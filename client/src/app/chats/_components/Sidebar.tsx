"use client";
import React from "react";
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
import { useQuery } from "react-query";
import axios from "axios";
import { PRIVATE_SERVER_URL } from "@/utils/serverUrl";
function Sidebar() {
  const router = useRouter();
  const { data, status } = useSession();
  const pathname = usePathname();
  const getNotifications = useQuery({
    queryKey: ["chat-notification"],
    queryFn: async () => {
      const response = await axios.get(
        `${PRIVATE_SERVER_URL}/user/chat/status/${data?.user.userId}`
      );
      return response.data.message;
    },
    enabled: status === "authenticated",
  });
  const navigationBtn = [
    {
      btnSticker: <IoMegaphone />,
      navigateTo: "/chats/public",
      styling: `text-[#6486FF] text-2xl p-3 rounded-md ${
        pathname === "/chats/public" && "bg-[#3A3B3C]"
      }`,
    },
    {
      btnSticker: <AiFillMessage />,
      navigateTo: `/chats/private/${
        getNotifications?.data ? getNotifications.data : "new"
      }?type=chats`,
      styling: `text-[#6486FF] text-2xl p-3 rounded-md ${
        pathname.startsWith("/chats/private") && "bg-[#3A3B3C]"
      }`,
    },
    {
      btnSticker: <MdGroups />,
      navigateTo: `/chats/group`,
      styling: `text-[#6486FF] text-2xl p-3 rounded-md ${
        pathname.startsWith("/chats/group") && "bg-[#3A3B3C]"
      }`,
    },
    {
      btnSticker: <PiMailboxFill />,
      navigateTo: `/mailbox/group`,
      styling: `text-[#6486FF] text-2xl p-3 rounded-md ${
        pathname.startsWith("/mailbox/group") && "bg-[#3A3B3C]"
      }`,
    },
  ];
  return (
    <div className=" flex justify-between items-center flex-col pt-4 h-full px-2">
      <div className="flex flex-col items-center w-full justify-center">
        {navigationBtn.map((btn, index) => (
          <button
            key={index}
            onClick={() => router.push(btn.navigateTo)}
            className={btn.styling}
          >
            {btn.btnSticker}
          </button>
        ))}
      </div>

      <div className="flex flex-col items-center w-full justify-center">
        {getNotifications.isLoading || !data?.user ? (
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
