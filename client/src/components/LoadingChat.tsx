import React from "react";
import chatLoadingAnimation from "../assets/images/gif-animation/chat-loading.gif";
import Image from "next/image";
function LoadingChat() {
  return (
    <div className="flex w-full items-center justify-center h-full">
      <Image
        src={chatLoadingAnimation}
        width={30}
        height={30}
        alt="chat-loading"
        priority
      />
    </div>
  );
}

export default LoadingChat;
