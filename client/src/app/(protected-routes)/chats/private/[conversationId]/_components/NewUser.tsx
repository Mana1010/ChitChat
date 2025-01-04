"use client";
import React from "react";
import newUser from "../../../../../../assets/images/svg/new-user-icon.svg";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
function NewUser() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  return (
    <div className="flex items-center justify-center w-full h-full flex-col space-y-2 side-background">
      <Image src={newUser} width={300} height={300} alt="new-user" priority />
      <h1 className="text-white text-center">
        You haven&apos;t made any conversation yet.
      </h1>
      <button
        onClick={() => router.push(`${pathname}?type=users`)}
        className="bg-[#6486FF] py-2 px-5 rounded-md text-white text-md"
      >
        Find Chat
      </button>
    </div>
  );
}

export default NewUser;
