import React, { ReactNode } from "react";
import Image from "next/image";
import emailIcon from "../../../../../assets/images/email.png";
import InvitationText from "./InvitationText";
import { getServerSession } from "next-auth";
import authOptions from "@/utils/authOption";
import { User } from "@/types/UserTypes";
function ParentDiv({ children }: { children: ReactNode }) {
  return <div className="flex w-full h-full bg-[#222222]">{children}</div>;
}
async function MailDetails({ mailId }: { mailId: string }) {
  const session = await getServerSession(authOptions);
  if (mailId === "mail" || mailId === "empty") {
    return (
      <ParentDiv>
        <Image
          src={emailIcon}
          alt="email-icon"
          width={100}
          height={100}
          priority
          className="self-center mx-auto"
        />
      </ParentDiv>
    );
  }
  return (
    <ParentDiv>
      <InvitationText
        mailId={mailId}
        session={session?.user as User | undefined}
      />
    </ParentDiv>
  );
}

export default MailDetails;
