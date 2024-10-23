import React, { ReactNode } from "react";
import Image from "next/image";
import emptyChatImg from "../assets/images/empty-box.png";
function EmptyConversation({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center w-full justify-center flex-col space-y-2 px-2">
      {" "}
      <Image
        src={emptyChatImg}
        width={100}
        height={100}
        alt="empty-chat-img"
        priority
      />
      {children}
    </div>
  );
}

export default EmptyConversation;
