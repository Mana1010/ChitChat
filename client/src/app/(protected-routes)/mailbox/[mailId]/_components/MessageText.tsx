"use client";
import React from "react";
import Image from "next/image";
import welcomeUser from "../../../../../assets/images/svg/welcome-mail.svg";
function MessageText() {
  return (
    <div className="w-full flex flex-col relative text-white justify-center items-center">
      <div className="flex flex-col space-y-1 items-center">
        <Image
          src={welcomeUser}
          alt="welcome-user-image"
          width={300}
          height={300}
          priority
        />
        <div className="w-1/2 space-y-2 flex flex-col">
          <h3 className="text-[0.9rem]">
            Welcome to <span className="text-[#6486FF]">ChitChat</span>
          </h3>
          <span className="leading-6 text-[0.9rem] py-3">
            We&apos;re thrilled to have you join our community! Start chatting,
            connecting, and sharing moments with ease. If you need any help,
            we&apos;re here for you. Happy chatting! 🎉
          </span>
          <div className="self-end flex-col flex text-[0.9rem] space-y-1">
            <h3>Best regards,</h3>
            <h3>
              <span className="text-[#6486FF]">ChitChat</span> Developer
            </h3>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MessageText;
