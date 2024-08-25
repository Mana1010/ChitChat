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

function Sidebar() {
  const router = useRouter();
  const { data } = useSession();
  return (
    <div className=" flex justify-between items-center flex-col pt-4 h-full px-3">
      <div className="flex flex-col items-center w-full justify-center">
        <button className={`text-[#6486FF] text-2xl`}>
          <AiFillMessage />
        </button>
      </div>

      <div className="flex flex-col items-center w-full justify-center">
        <DropdownMenu>
          <DropdownMenuTrigger className="h-8 w-8 relative overflow-hidden rounded-full">
            {" "}
            <Image
              src={data?.user.image ?? ""}
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
