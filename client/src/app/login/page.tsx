import React from "react";
import Image from "next/image";
import conversationImg from "../../assets/images/conversation-icon.png";
import Login from "./_components/Login";
export const metadata = {
  title: "Login Page",
};
function Page() {
  return (
    <div className="bg-[#E6E7E4] w-full h-screen relative">
      <Image
        src={conversationImg}
        width={300}
        height={300}
        alt="conversation-sticker"
        priority
        className="absolute right-5"
      />
      <Login />
    </div>
  );
}

export default Page;
