"use client";
import React, { Dispatch, ReactNode, SetStateAction, useEffect } from "react";
import { useQuery, UseQueryResult } from "react-query";
import { MdOutlineTransitEnterexit } from "react-icons/md";
import Image from "next/image";
import { FcGoogle } from "react-icons/fc";
import piltoverTower from "../../../../assets/images/piltover-tower.png";
import axios, { AxiosError } from "axios";
import { SHARED_SERVER_URL } from "@/utils/serverUrl";
import { ProfileDetails } from "@/types/shared.types";
import { formatDistanceToNow } from "date-fns";
import loadingAnimation from "../../../../assets/images/gif-animation/component-loading.gif";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

function ParentDiv({ children }: { children: ReactNode }) {
  return (
    <div className="w-full flex justify-end items-end bg-black/30 absolute inset-0 z-50 h-full">
      <div className=" w-[350px] h-full">{children}</div>
    </div>
  );
}
function ProfileCard({
  conversationId,
  setOpenProfileModal,
  participantId,
}: {
  conversationId: string;
  setOpenProfileModal: Dispatch<SetStateAction<boolean>>;
  participantId: string;
}) {
  const getParticipantProfile: UseQueryResult<
    ProfileDetails,
    AxiosError<{ message: string }>
  > = useQuery({
    queryKey: ["user-full-profile", conversationId],
    queryFn: async () => {
      const response = await axios(
        `${SHARED_SERVER_URL}/participant/profile/${participantId}`
      );
      return response.data;
    },
    enabled: !!participantId,
  });
  console.log(participantId);
  const participant_details = getParticipantProfile.data?.participant_details;
  if (getParticipantProfile.isLoading) {
    return (
      <ParentDiv>
        <div className="flex items-center justify-center w-full h-full">
          <Image
            src={loadingAnimation}
            alt="loading-animation"
            width={100}
            height={100}
            priority
          />
        </div>
      </ParentDiv>
    );
  }
  return (
    <ParentDiv>
      <div className="w-full flex flex-col h-full relative">
        <div className="w-full relative h-[150px] pb-10">
          <Image
            src={piltoverTower}
            alt="piltover-progress-img"
            fill
            sizes="100%"
            className="absolute"
            priority
          />
          {/* Profile Name and Photo*/}
          <div className="bottom-[-45px] absolute inset-x-0 w-full overflow-hidden">
            <div className=" flex space-x-2 items-end pl-3">
              <div className="w-20 h-20 relative rounded-full border-[#6486FF] border-2 flex-shrink-0">
                <Image
                  src={participant_details?.profilePic as string}
                  alt={`${participant_details?.name}'s profile picture`}
                  sizes="100%"
                  fill
                  className="absolute rounded-full"
                  priority
                />
                <span
                  className={`w-3 h-3 ${
                    participant_details?.status.type === "online"
                      ? "bg-green-500"
                      : "bg-zinc-500"
                  } rounded-full absolute bottom-1 right-1.5`}
                ></span>
              </div>
              <div className="leading-5 pb-0.5 flex-grow flex flex-col">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger
                      role="name"
                      className="font-extrabold text-[#6486FF] text-md truncate max-w-[230px] text-start"
                    >
                      {participant_details?.name}
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{participant_details?.name}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <span className="text-slate-300 text-[0.7rem]">
                  {participant_details?.status.type === "online"
                    ? "Active Now"
                    : `Active ${formatDistanceToNow(
                        participant_details?.status.lastActiveAt as Date,
                        {
                          addSuffix: true,
                        }
                      )}`}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Provider */}
        <div className="flex-grow pt-16 px-4 space-y-2 profile-container w-full">
          <div
            style={{
              clipPath:
                "polygon(0% 0%, 100% 0%, 100% 75%, 75% 75%, 75% 100%, 50% 75%, 0% 75%)",
            }}
            className="w-1/2 shadow-black shadow rounded-md pt-2 px-2 pb-6 bg-[#6486FF] flex items-start justify-center"
          >
            <small className="text-white text-[0.8rem] text-center whitespace-pre-wrap">
              {participant_details?.bio}
            </small>
          </div>
          {/* Profile Email */}
          <div>
            <h5 className="text-white text-center text-[0.8rem]">
              {participant_details?.email}
            </h5>
          </div>
        </div>
        {/* The Exit button */}
        <div className="flex items-center justify-center w-full absolute bottom-10">
          <button
            onClick={() => setOpenProfileModal((prev) => !prev)}
            className=" w-10 h-10 rounded-full bg-[#414141] text-[#6486FF] shadow-md flex items-center justify-center"
          >
            <MdOutlineTransitEnterexit />
          </button>
        </div>
      </div>
    </ParentDiv>
  );
}

export default ProfileCard;
