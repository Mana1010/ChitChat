"use client";
import React, { ReactNode } from "react";
import Image from "next/image";
import emailIcon from "../../../../../assets/images/svg/mailbox.svg";
import InvitationText from "./InvitationText";
import { getServerSession } from "next-auth";
import authOptions from "@/utils/authOption";
import { User } from "@/types/UserTypes";
import { useSession } from "next-auth/react";
import { APP_SERVER_URL } from "@/utils/serverUrl";
import { UseQueryResult, useQuery } from "react-query";
import axios, { AxiosError } from "axios";
import { MailDetailsSchema } from "@/types/app.types";
import MessageText from "./MessageText";
import LoadingChat from "@/components/LoadingChat";
function ParentDiv({ children }: { children: ReactNode }) {
  return <div className="flex w-full h-full mail-div">{children}</div>;
}
function MailDetails({ mailId }: { mailId: string }) {
  const checkIfParamsValid = ["mail", "empty"].includes(mailId);

  const { data: session, status } = useSession();
  const getMailContent: UseQueryResult<
    MailDetailsSchema,
    AxiosError<{ message: string }>
  > = useQuery({
    queryKey: ["mail-details", mailId],
    queryFn: async () => {
      const response = await axios.get(
        `${APP_SERVER_URL}/mail/details/${session?.user.userId}/${mailId}`
      );
      return response.data.message;
    },
    enabled: status === "authenticated" || !checkIfParamsValid,
    onSuccess: (data) => {
      console.log(data);
    },
  });
  if (checkIfParamsValid) {
    return (
      <ParentDiv>
        <Image
          src={emailIcon}
          alt="email-icon"
          width={350}
          height={350}
          priority
          className="self-center mx-auto"
        />
      </ParentDiv>
    );
  }
  if (getMailContent.isLoading) {
    return (
      <ParentDiv>
        <LoadingChat />
      </ParentDiv>
    );
  }
  return (
    <ParentDiv>
      {getMailContent.data?.kind === "invitation" ? (
        <InvitationText getMailContent={getMailContent.data} />
      ) : (
        <MessageText />
      )}
    </ParentDiv>
  );
}

export default MailDetails;
