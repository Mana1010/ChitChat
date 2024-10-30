"use client";
import React from "react";
import emptyChat from "../../../../../../assets/images/empty-chat.png";
import Image from "next/image";
import { useRouter } from "next/navigation";
function UserNotFound({ errorMessage }: { errorMessage: string }) {
  const router = useRouter();
  return (
    <div className="flex items-center justify-center w-full h-full flex-col space-y-2">
      <Image
        src={emptyChat}
        width={300}
        height={300}
        alt="empty-chat"
        priority
      />
      <h1 className="text-white text-2xl text-center">{errorMessage}</h1>
      <button
        onClick={() => router.back()}
        className="bg-[#6486FF] py-2 px-4 font-bold rounded-md"
      >
        BACK
      </button>
    </div>
  );
}

export default UserNotFound;
