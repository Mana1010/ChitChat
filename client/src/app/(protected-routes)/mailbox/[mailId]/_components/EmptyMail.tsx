import React, { ReactNode } from "react";
import Image from "next/image";
import emptyMailImg from "../../../../../assets/images/empty-chat.png";
function EmptyMail() {
  return (
    <div className="flex items-center w-full justify-center flex-col space-y-2 px-2 h-full">
      {" "}
      <Image
        src={emptyMailImg}
        width={100}
        height={100}
        alt="empty-mail-img"
        priority
      />
      <h1 className="text-zinc-300 text-[1.1rem] break-all text-center">
        Empty Mail
      </h1>
    </div>
  );
}

export default EmptyMail;
