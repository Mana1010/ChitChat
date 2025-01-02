import React from "react";
import barrierImg from "../../../../../../assets/images/forbidden.png";
import Image from "next/image";
function OnlyAdminAccess({ errorMessage }: { errorMessage: string }) {
  return (
    <div className="w-full flex items-center justify-center space-y-2 flex-col h-full">
      <Image
        src={barrierImg}
        width={100}
        height={100}
        alt="forbidden"
        priority
      />
      <h1 className="text-white font-bold text-center">{errorMessage}</h1>
    </div>
  );
}

export default OnlyAdminAccess;
