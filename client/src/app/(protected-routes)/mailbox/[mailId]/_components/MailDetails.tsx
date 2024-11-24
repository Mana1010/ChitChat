"use client";
import React, { ReactNode } from "react";
import Image from "next/image";
import emailIcon from "../../../../../assets/images/svg/mailbox.svg";
import InvitationText from "./InvitationText";
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
      {(() => {
        switch (getMailContent.data?.kind) {
          case "invitation":
            return (
              <InvitationText
                getMailContent={getMailContent.data}
                mailId={mailId}
              />
            );
          case "message":
            return <MessageText />;
          case "request":
            return <h1>Request</h1>;
          default:
            return <h1>No Mail created</h1>;
        }
      })()}
    </ParentDiv>
  );
}

export default MailDetails;
