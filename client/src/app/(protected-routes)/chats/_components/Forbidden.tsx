"use client";
import React from "react";
import forbiddenChat from "../../../../assets/images/svg/forbidden-chat.svg";
import Image from "next/image";
import { useRouter } from "next/navigation";
function Forbidden({ errorMessage }: { errorMessage: string }) {
  const router = useRouter();
  return (
    <div className="flex items-center justify-center w-full h-full flex-col space-y-2 side-background">
      <Image
        src={forbiddenChat}
        width={300}
        height={300}
        alt="forbidden-chat"
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

export default Forbidden;
