import React from "react";
import loadingAnimation from "../assets/images/gif-animation/component-loading.gif";
import Image from "next/image";
function Loading() {
  return (
    <div className="flex items-center justify-center w-full h-screen">
      <Image src={loadingAnimation} alt="loading-animation" priority />
    </div>
  );
}

export default Loading;
