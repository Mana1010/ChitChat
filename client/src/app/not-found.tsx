"use client";
import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import pageNotFoundSticker from "./../assets/images/svg/page-not-found.svg";
function NotFound() {
  const router = useRouter();
  return (
    <div className="w-full h-screen flex items-center justify-center flex-col side-background">
      <Image
        src={pageNotFoundSticker}
        width={500}
        height={500}
        alt="page-not-found-sticker"
        priority
      />
      <button
        onClick={() => router.back()}
        className="text-white px-10 py-2 rounded-sm text-md bg-[#6486FF]"
      >
        Back
      </button>
    </div>
  );
}

export default NotFound;
