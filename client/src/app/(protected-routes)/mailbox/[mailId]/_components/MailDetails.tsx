"use client";
import React, { ReactNode } from "react";
import Image from "next/image";
import emailIcon from "../../../../../assets/images/svg/mailbox.svg";
import InvitationText from "./InvitationText";
import { useSession } from "next-auth/react";
import { APP_SERVER_URL } from "@/utils/serverUrl";
import { UseQueryResult, useQuery } from "react-query";
import axios, { AxiosError } from "axios";
import MessageText from "./MessageText";
import RequestText from "./RequestText";
import LoadingChat from "@/components/LoadingChat";
function ParentDiv({ children }: { children: ReactNode }) {
  return <div className="flex w-full h-full mail-div">{children}</div>;
}
function MailDetails({ mailId }: { mailId: string }) {
  const checkIfParamsValid = ["mail", "empty"].includes(mailId);
  const { status } = useSession();
  const getMailType: UseQueryResult<
    string,
    AxiosError<{ message: string }>
  > = useQuery({
    queryKey: ["mail-type", mailId],
    queryFn: async () => {
      const response = await axios.get(`${APP_SERVER_URL}/mail/type/${mailId}`);
      return response.data;
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

  if (getMailType.isLoading) {
    return <LoadingChat />;
  }
  return (
    <ParentDiv>
      {(() => {
        switch (getMailType.data) {
          case "invitation":
            return <InvitationText mailId={mailId} />;
          case "message":
            return <MessageText />;
          case "request":
            return <RequestText mailId={mailId} />;
          default:
            return (
              <h1 className="text-white text-center pt-3">No Mail created</h1>
            );
        }
      })()}
    </ParentDiv>
  );
}

export default MailDetails;
