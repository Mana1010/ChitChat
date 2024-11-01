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
import invited from "../../../../../assets/images/invited.png";
import { CiCircleCheck } from "react-icons/ci";
import { CiCircleRemove } from "react-icons/ci";
function InvitationText({
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
      <div className="flex-grow items-center flex justify-center flex-col">
        <Image
          src={invited}
          alt="invited-icon"
          width={200}
          height={200}
          priority
        />
        <h1 className="text-white text-xl font-bold">
          You&apos;re Invited to Join the Group Chat!
        </h1>
        <div className="space-x-2 pt-2 flex items-center">
          <button className="py-2 px-3 bg-red-500 text-white rounded-sm flex items-center space-x-2">
            <span className="text-lg">
              <CiCircleRemove />
            </span>
            <span>Reject</span>
          </button>
          <button className="py-2 px-3 bg-[#6486FF] text-white rounded-sm flex items-center space-x-2">
            <span className="text-lg">
              <CiCircleCheck />
            </span>
            <span>Accept</span>
          </button>
        </div>
      </div>
      <footer className="p-3 flex justify-end">
        <button
          disabled
          className="py-2 px-4 bg-[#6486FF] text-white rounded-sm flex items-center space-x-2 disabled:bg-zinc-500"
        >
          Delete Mail
        </button>
      </footer>
    </div>
  );
}

export default InvitationText;
