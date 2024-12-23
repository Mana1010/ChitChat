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
import { formatDistanceToNow, format } from "date-fns";
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
              <div className="flex-grow space-y-1">
                <div className="flex items-center flex-grow space-x-0.5">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <div className="bg-[#3A3B3C] py-1 px-3 flex space-x-1 rounded-sm items-center border border-slate-600">
                          <svg
                            width="20px"
                            height="20px"
                            viewBox="-2.4 -2.4 28.80 28.80"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            stroke="#000000"
                            stroke-width="0.00024000000000000003"
                          >
                            <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                            <g
                              id="SVGRepo_tracerCarrier"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                            ></g>
                            <g id="SVGRepo_iconCarrier">
                              {" "}
                              <path
                                fill-rule="evenodd"
                                clip-rule="evenodd"
                                d="M10.4606 1.25H13.5394C15.1427 1.24999 16.3997 1.24999 17.4039 1.34547C18.4274 1.44279 19.2655 1.64457 20.0044 2.09732C20.7781 2.57144 21.4286 3.22194 21.9027 3.99563C22.3554 4.73445 22.5572 5.57256 22.6545 6.59611C22.75 7.60029 22.75 8.85725 22.75 10.4606V11.5278C22.75 12.6691 22.75 13.564 22.7007 14.2868C22.6505 15.0223 22.5468 15.6344 22.3123 16.2004C21.7287 17.6093 20.6093 18.7287 19.2004 19.3123C18.3955 19.6457 17.4786 19.7197 16.2233 19.7413C15.7842 19.7489 15.5061 19.7545 15.2941 19.7779C15.096 19.7999 15.0192 19.832 14.9742 19.8582C14.9268 19.8857 14.8622 19.936 14.7501 20.0898C14.6287 20.2564 14.4916 20.4865 14.2742 20.8539L13.7321 21.7697C12.9585 23.0767 11.0415 23.0767 10.2679 21.7697L9.72579 20.8539C9.50835 20.4865 9.37122 20.2564 9.24985 20.0898C9.13772 19.936 9.07313 19.8857 9.02572 19.8582C8.98078 19.832 8.90399 19.7999 8.70588 19.7779C8.49387 19.7545 8.21575 19.7489 7.77666 19.7413C6.52138 19.7197 5.60454 19.6457 4.79957 19.3123C3.39066 18.7287 2.27128 17.6093 1.68769 16.2004C1.45323 15.6344 1.3495 15.0223 1.29932 14.2868C1.24999 13.564 1.25 12.6691 1.25 11.5278L1.25 10.4606C1.24999 8.85726 1.24999 7.60029 1.34547 6.59611C1.44279 5.57256 1.64457 4.73445 2.09732 3.99563C2.57144 3.22194 3.22194 2.57144 3.99563 2.09732C4.73445 1.64457 5.57256 1.44279 6.59611 1.34547C7.60029 1.24999 8.85726 1.24999 10.4606 1.25ZM6.73809 2.83873C5.82434 2.92561 5.24291 3.09223 4.77938 3.37628C4.20752 3.72672 3.72672 4.20752 3.37628 4.77938C3.09223 5.24291 2.92561 5.82434 2.83873 6.73809C2.75079 7.663 2.75 8.84876 2.75 10.5V11.5C2.75 12.6751 2.75041 13.5189 2.79584 14.1847C2.84081 14.8438 2.92737 15.2736 3.07351 15.6264C3.50486 16.6678 4.33223 17.4951 5.3736 17.9265C5.88923 18.1401 6.54706 18.2199 7.8025 18.2416L7.83432 18.2421C8.23232 18.249 8.58109 18.2549 8.87097 18.287C9.18246 18.3215 9.4871 18.3912 9.77986 18.5615C10.0702 18.7304 10.2795 18.9559 10.4621 19.2063C10.6307 19.4378 10.804 19.7306 11.0004 20.0623L11.5587 21.0057C11.7515 21.3313 12.2485 21.3313 12.4412 21.0057L12.9996 20.0623C13.1959 19.7306 13.3692 19.4378 13.5379 19.2063C13.7204 18.9559 13.9298 18.7304 14.2201 18.5615C14.5129 18.3912 14.8175 18.3215 15.129 18.287C15.4189 18.2549 15.7676 18.249 16.1656 18.2421L16.1975 18.2416C17.4529 18.2199 18.1108 18.1401 18.6264 17.9265C19.6678 17.4951 20.4951 16.6678 20.9265 15.6264C21.0726 15.2736 21.1592 14.8438 21.2042 14.1847C21.2496 13.5189 21.25 12.6751 21.25 11.5V10.5C21.25 8.84876 21.2492 7.663 21.1613 6.73809C21.0744 5.82434 20.9078 5.24291 20.6237 4.77938C20.2733 4.20752 19.7925 3.72672 19.2206 3.37628C18.7571 3.09223 18.1757 2.92561 17.2619 2.83873C16.337 2.75079 15.1512 2.75 13.5 2.75H10.5C8.84876 2.75 7.663 2.75079 6.73809 2.83873Z"
                                fill="#6486FF"
                              ></path>{" "}
                              <path
                                d="M9 11C9 11.5523 8.55228 12 8 12C7.44772 12 7 11.5523 7 11C7 10.4477 7.44772 10 8 10C8.55228 10 9 10.4477 9 11Z"
                                fill="#6486FF"
                              ></path>{" "}
                              <path
                                d="M13 11C13 11.5523 12.5523 12 12 12C11.4477 12 11 11.5523 11 11C11 10.4477 11.4477 10 12 10C12.5523 10 13 10.4477 13 11Z"
                                fill="#6486FF"
                              ></path>{" "}
                              <path
                                d="M17 11C17 11.5523 16.5523 12 16 12C15.4477 12 15 11.5523 15 11C15 10.4477 15.4477 10 16 10C16.5523 10 17 10.4477 17 11Z"
                                fill="#6486FF"
                              ></path>{" "}
                            </g>
                          </svg>
                          <span className="text-white text-[0.85rem]">
                            {" "}
                            {
                              getParticipantProfile.data
                                ?.total_participant_private_chat
                            }
                          </span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Total Chatmate</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <div className="bg-[#3A3B3C] py-1 px-3 flex space-x-1 rounded-sm items-center border border-slate-600">
                          <svg
                            width="20px"
                            height="20px"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            transform="matrix(1, 0, 0, 1, 0, 0)"
                          >
                            <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                            <g
                              id="SVGRepo_tracerCarrier"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke="#CCCCCC"
                              stroke-width="0.672"
                            ></g>
                            <g id="SVGRepo_iconCarrier">
                              {" "}
                              <path
                                fill-rule="evenodd"
                                clip-rule="evenodd"
                                d="M12 1.25C9.37665 1.25 7.25 3.37665 7.25 6C7.25 8.62335 9.37665 10.75 12 10.75C14.6234 10.75 16.75 8.62335 16.75 6C16.75 3.37665 14.6234 1.25 12 1.25ZM8.75 6C8.75 4.20507 10.2051 2.75 12 2.75C13.7949 2.75 15.25 4.20507 15.25 6C15.25 7.79493 13.7949 9.25 12 9.25C10.2051 9.25 8.75 7.79493 8.75 6Z"
                                fill="#6486FF"
                              ></path>{" "}
                              <path
                                d="M18 3.25C17.5858 3.25 17.25 3.58579 17.25 4C17.25 4.41421 17.5858 4.75 18 4.75C19.3765 4.75 20.25 5.65573 20.25 6.5C20.25 7.34427 19.3765 8.25 18 8.25C17.5858 8.25 17.25 8.58579 17.25 9C17.25 9.41421 17.5858 9.75 18 9.75C19.9372 9.75 21.75 8.41715 21.75 6.5C21.75 4.58285 19.9372 3.25 18 3.25Z"
                                fill="#6486FF"
                              ></path>{" "}
                              <path
                                d="M6.75 4C6.75 3.58579 6.41421 3.25 6 3.25C4.06278 3.25 2.25 4.58285 2.25 6.5C2.25 8.41715 4.06278 9.75 6 9.75C6.41421 9.75 6.75 9.41421 6.75 9C6.75 8.58579 6.41421 8.25 6 8.25C4.62351 8.25 3.75 7.34427 3.75 6.5C3.75 5.65573 4.62351 4.75 6 4.75C6.41421 4.75 6.75 4.41421 6.75 4Z"
                                fill="#6486FF"
                              ></path>{" "}
                              <path
                                fill-rule="evenodd"
                                clip-rule="evenodd"
                                d="M12 12.25C10.2157 12.25 8.56645 12.7308 7.34133 13.5475C6.12146 14.3608 5.25 15.5666 5.25 17C5.25 18.4334 6.12146 19.6392 7.34133 20.4525C8.56645 21.2692 10.2157 21.75 12 21.75C13.7843 21.75 15.4335 21.2692 16.6587 20.4525C17.8785 19.6392 18.75 18.4334 18.75 17C18.75 15.5666 17.8785 14.3608 16.6587 13.5475C15.4335 12.7308 13.7843 12.25 12 12.25ZM6.75 17C6.75 16.2242 7.22169 15.4301 8.17338 14.7956C9.11984 14.1646 10.4706 13.75 12 13.75C13.5294 13.75 14.8802 14.1646 15.8266 14.7956C16.7783 15.4301 17.25 16.2242 17.25 17C17.25 17.7758 16.7783 18.5699 15.8266 19.2044C14.8802 19.8354 13.5294 20.25 12 20.25C10.4706 20.25 9.11984 19.8354 8.17338 19.2044C7.22169 18.5699 6.75 17.7758 6.75 17Z"
                                fill="#6486FF"
                              ></path>{" "}
                              <path
                                d="M19.2674 13.8393C19.3561 13.4347 19.7561 13.1787 20.1607 13.2674C21.1225 13.4783 21.9893 13.8593 22.6328 14.3859C23.2758 14.912 23.75 15.6352 23.75 16.5C23.75 17.3648 23.2758 18.088 22.6328 18.6141C21.9893 19.1407 21.1225 19.5217 20.1607 19.7326C19.7561 19.8213 19.3561 19.5653 19.2674 19.1607C19.1787 18.7561 19.4347 18.3561 19.8393 18.2674C20.6317 18.0936 21.2649 17.7952 21.6829 17.4532C22.1014 17.1108 22.25 16.7763 22.25 16.5C22.25 16.2237 22.1014 15.8892 21.6829 15.5468C21.2649 15.2048 20.6317 14.9064 19.8393 14.7326C19.4347 14.6439 19.1787 14.2439 19.2674 13.8393Z"
                                fill="#6486FF"
                              ></path>{" "}
                              <path
                                d="M3.83935 13.2674C4.24395 13.1787 4.64387 13.4347 4.73259 13.8393C4.82132 14.2439 4.56525 14.6439 4.16065 14.7326C3.36829 14.9064 2.73505 15.2048 2.31712 15.5468C1.89863 15.8892 1.75 16.2237 1.75 16.5C1.75 16.7763 1.89863 17.1108 2.31712 17.4532C2.73505 17.7952 3.36829 18.0936 4.16065 18.2674C4.56525 18.3561 4.82132 18.7561 4.73259 19.1607C4.64387 19.5653 4.24395 19.8213 3.83935 19.7326C2.87746 19.5217 2.0107 19.1407 1.36719 18.6141C0.724248 18.088 0.25 17.3648 0.25 16.5C0.25 15.6352 0.724248 14.912 1.36719 14.3859C2.0107 13.8593 2.87746 13.4783 3.83935 13.2674Z"
                                fill="#6486FF"
                              ></path>{" "}
                            </g>
                          </svg>
                          <span className="text-white text-[0.85rem]">
                            {
                              getParticipantProfile.data
                                ?.total_participant_joined_group
                            }
                          </span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Total Joined Group</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className="leading-5 pb-0.5 w-full flex flex-col">
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
        </div>

        {/* Profile Provider */}
        <div className="flex-grow pt-16 px-4 space-y-2 profile-container w-full">
          <div className="w-full flex flex-col space-y-3">
            {/* Profile Bio */}
            <div>
              <span className="text-[0.7rem] font-semibold text-white">
                Bio
              </span>
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
            </div>
            {/* Profile Email */}
            <div className="self-end space-y-1 flex flex-col justify-self-end">
              <span className="text-[0.7rem] font-semibold text-white text-end">
                Email
              </span>
              <div className="p-3 rounded-sm  bg-[#6486FF]">
                <h5 className="text-white text-[0.8rem]">
                  {participant_details?.email}
                </h5>
              </div>
            </div>
            <div>
              <span className="text-[0.7rem] font-semibold text-white">
                Joined At{" "}
                <span className="italic text-[0.5rem]">(MM/DD/YY)</span>
              </span>
              <div
                style={{
                  clipPath:
                    "polygon(0% 0%, 100% 0%, 100% 75%, 75% 75%, 75% 100%, 50% 75%, 0% 75%)",
                }}
                className="w-1/2 shadow-black shadow rounded-md pt-2 px-2 pb-6 bg-[#6486FF] flex items-start justify-center"
              >
                <small className="text-white text-[0.8rem] text-center whitespace-pre-wrap">
                  {format(participant_details?.createdAt as Date, "MM/dd/yyyy")}
                </small>
              </div>
            </div>
          </div>
        </div>
        {/* The Exit button */}
        <div className="flex items-center justify-center w-full absolute bottom-8">
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
