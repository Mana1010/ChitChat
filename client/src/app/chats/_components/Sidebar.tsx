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
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { IoMegaphone } from "react-icons/io5";
import { usePathname } from "next/navigation";
import pic from "../../../assets/images/conversation-icon.png";
function Sidebar() {
  const router = useRouter();
  const { data } = useSession();
  const pathname = usePathname();
  return (
    <div className=" flex justify-between items-center flex-col pt-4 h-full px-2">
      <div className="flex flex-col items-center w-full justify-center">
        <button
          onClick={() => router.push("/chats/public")}
          className={`text-[#6486FF] text-2xl p-3 rounded-md ${
            pathname === "/chats/public" && "bg-[#3A3B3C]"
          }`}
        >
          <IoMegaphone />
        </button>
        <button
          onClick={() => router.push("/chats/private/wdd")}
          className={`text-[#6486FF] text-2xl p-3 rounded-md ${
            pathname.startsWith("/chats/private") && "bg-[#3A3B3C]"
          }`}
        >
          <AiFillMessage />
        </button>
      </div>

      <div className="flex flex-col items-center w-full justify-center">
        <DropdownMenu>
          <DropdownMenuTrigger className="h-8 w-8 relative overflow-hidden rounded-full">
            {" "}
            <Image
              src={data?.user.image ?? pic}
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
      </div>
    </div>
  );
}

export default Sidebar;
