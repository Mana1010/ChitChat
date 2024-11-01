"use client";
import React from "react";
import Image from "next/image";
import { useQuery, UseQueryResult } from "react-query";
import axios, { AxiosError } from "axios";
import { APP_SERVER_URL } from "@/utils/serverUrl";
import { MailDetailsSchema } from "@/types/app.types";
import { MdGroups } from "react-icons/md";
import mailInvitation from "../../../../../assets/images/mail-invitation.png";
import { User } from "@/types/UserTypes";
function MessageText({
  mailId,
  session,
}: {
  mailId: string;
  session: User | undefined;
}) {
  const getMailContent: UseQueryResult<
    MailDetailsSchema,
    AxiosError<{ message: string }>
  > = useQuery({
    queryKey: ["mail-details", mailId],
    queryFn: async () => {
      const response = await axios.get(
        `${APP_SERVER_URL}/mail/details/${session?.userId}/${mailId}`
      );
      return response.data.message;
    },
    enabled: !!session,
  });
  if (getMailContent.isLoading) {
    return <h1>Loading...</h1>;
  }
  return (
    <div className="w-full flex flex-col relative overflow-hidden">
      <header className="py-5 flex items-center justify-between px-3 ">
        <div className="flex space-x-3 items-center">
          <Image
            src={getMailContent.data?.group_details.groupPhoto.photoUrl ?? ""}
            alt="group-photo"
            width={80}
            height={80}
            priority
          />
          <div className="flex flex-col space-y-2">
            <h1 className="text-white text-lg font-bold">
              {getMailContent.data?.group_details.groupName}
            </h1>
            <div className="flex items-center space-x-2">
              <span className="text-[#6486FF] text-lg">
                <MdGroups />
              </span>
              <span className="text-white text-[0.8rem] font-semibold">
                {getMailContent.data?.group_details.total_member}
              </span>
            </div>
          </div>
        </div>
      </header>
      <div className="absolute -right-2 opacity-90 top-[5px] ">
        <Image
          src={mailInvitation}
          alt="mailinvitation"
          width={150}
          height={150}
          priority
          className="-rotate-12"
        />
      </div>
      <div className="px-3 space-y-3">
        <div className="flex space-x-2 rounded-md items-center">
          <h2 className=" font-bold text-[#6486FF] text-sm">Subject: </h2>
          <h4 className="text-[#EEEEEE] text-sm">
            {`Group Chat Invitation – Join Request from ${getMailContent.data?.group_details.groupName}`}
          </h4>
        </div>
        <div className="pt-4">
          <h2 className="text-sm">{`Hello ${session?.name}`}</h2>
        </div>
        <div className="pt-4 space-y-5">
          <h2 className="text-sm">{`You have been invited to join the ${getMailContent.data?.group_details.groupName} group chat!`}</h2>
          <h2 className="text-sm">
            This group connects you with others to discuss, share updates, and
            collaborate on topics you care about.
          </h2>
        </div>
      </div>
    </div>
  );
}

export default MessageText;
