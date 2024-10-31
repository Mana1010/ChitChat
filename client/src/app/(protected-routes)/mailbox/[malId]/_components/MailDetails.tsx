"use client";
import React, { ReactNode } from "react";
import Image from "next/image";
import emailIcon from "../../../../../assets/images/email.png";
function ParentDiv({ children }: { children: ReactNode }) {
  return (
    <div className="flex w-full h-full flex-col bg-[#222222] items-center justify-center">
      {children}
    </div>
  );
}
function MailDetails({ mailId }: { mailId: string }) {
  if (mailId === "mail" || mailId === "empty") {
    return (
      <ParentDiv>
        <Image
          src={emailIcon}
          alt="email-icon"
          width={100}
          height={100}
          priority
        />
      </ParentDiv>
    );
  }
  return (
    <ParentDiv>
      <h1>{mailId}</h1>
    </ParentDiv>
  );
}

export default MailDetails;
