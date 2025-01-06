import React, { ReactNode } from "react";
import Image from "next/image";
import noSearchFoundImg from "../assets/images/not-found.png";
function NoItemFound({ children }: { children: ReactNode }) {
  return (
    <div className="flex w-full items-center justify-center flex-col space-y-2 px-2 h-full">
      <Image
        src={noSearchFoundImg}
        width={100}
        height={100}
        alt="no-search-found"
        priority
      />

      <h2 className="text-zinc-300 text-[1.1rem] break-all text-center">
        {children}
      </h2>
    </div>
  );
}

export default NoItemFound;
