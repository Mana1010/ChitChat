"use client";
import React, { Dispatch, ReactNode, SetStateAction, useState } from "react";
import { useQuery, UseQueryResult } from "react-query";
import { MdOutlineTransitEnterexit } from "react-icons/md";
import Image from "next/image";
import groupDetailsBg from "../../../../../../assets/images/group_details_background.png";
import axios, { AxiosError } from "axios";
import { GROUP_SERVER_URL } from "@/utils/serverUrl";
import loadingAnimation from "../../../../../../assets/images/gif-animation/component-loading.gif";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useSession } from "next-auth/react";
import { BaseGroupChatSchema } from "@/types/shared.types";
import { format } from "date-fns";
import GroupMemberList from "./GroupMemberList";
function ParentDiv({ children }: { children: ReactNode }) {
  return (
    <div className="w-full flex justify-end items-end bg-black/30 absolute inset-0 z-50 h-full">
      <div className=" w-[350px] h-full">{children}</div>
    </div>
  );
}
function GroupDetails({
  groupId,
  setOpenGroupDetailsModal,
}: {
  groupId: string;
  setOpenGroupDetailsModal: Dispatch<SetStateAction<boolean>>;
}) {
  const [memberFilterStatus, setMemberFilterStatus] = useState<
    "active" | "requesting" | "pending"
  >("active");
  const { data: session, status } = useSession();
  const getGroupDetails: UseQueryResult<
    Pick<
      BaseGroupChatSchema,
      "_id" | "createdAt" | "groupName" | "groupPhoto"
    > & { total_active_member: number; is_group_active: boolean },
    AxiosError<{ message: string }>
  > = useQuery({
    queryKey: ["group-chat-details", groupId],
    queryFn: async () => {
      const response = await axios.get(
        `${GROUP_SERVER_URL}/group/chat/full/details/${groupId}/${session?.user.userId}`
      );
      return response.data;
    },
    enabled: status === "authenticated",
  });
  if (getGroupDetails.isLoading) {
    return (
      <ParentDiv>
        <div className="flex items-center justify-center w-full h-full bg-[#222222]">
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
  const group_details = getGroupDetails.data;
  return (
    <ParentDiv>
      <div className="w-full flex flex-col h-full relative">
        <div className="w-full relative h-[150px] pb-10">
          <Image
            src={groupDetailsBg}
            alt="family-arcane-pic"
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
                  src={group_details?.groupPhoto as string}
                  alt={`${group_details?.groupName}'s profile picture`}
                  sizes="100%"
                  fill
                  className="absolute rounded-full"
                  priority
                />
                <span
                  className={`w-3 h-3 ${
                    group_details?.is_group_active
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
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            transform="matrix(1, 0, 0, 1, 0, 0)"
                          >
                            <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                            <g
                              id="SVGRepo_tracerCarrier"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              stroke="#CCCCCC"
                              strokeWidth="0.672"
                            ></g>
                            <g id="SVGRepo_iconCarrier">
                              {" "}
                              <path
                                fillRule="evenodd"
                                clipRule="evenodd"
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
                                fillRule="evenodd"
                                clipRule="evenodd"
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
                            {" "}
                            {group_details?.total_active_member}
                          </span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Total Member</p>
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
                          >
                            <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                            <g
                              id="SVGRepo_tracerCarrier"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            ></g>
                            <g id="SVGRepo_iconCarrier">
                              {" "}
                              <path
                                d="M14 22H10C6.22876 22 4.34315 22 3.17157 20.8284C2 19.6569 2 17.7712 2 14V12C2 8.22876 2 6.34315 3.17157 5.17157C4.34315 4 6.22876 4 10 4H14C17.7712 4 19.6569 4 20.8284 5.17157C22 6.34315 22 8.22876 22 12V14C22 17.7712 22 19.6569 20.8284 20.8284C20.1752 21.4816 19.3001 21.7706 18 21.8985"
                                stroke="#6486FF"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                              ></path>{" "}
                              <path
                                d="M7 4V2.5"
                                stroke="#6486FF"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                              ></path>{" "}
                              <path
                                d="M17 4V2.5"
                                stroke="#6486FF"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                              ></path>{" "}
                              <path
                                d="M21.5 9H16.625H10.75M2 9H5.875"
                                stroke="#6486FF"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                              ></path>{" "}
                              <path
                                d="M18 17C18 17.5523 17.5523 18 17 18C16.4477 18 16 17.5523 16 17C16 16.4477 16.4477 16 17 16C17.5523 16 18 16.4477 18 17Z"
                                fill="#6486FF"
                              ></path>{" "}
                              <path
                                d="M18 13C18 13.5523 17.5523 14 17 14C16.4477 14 16 13.5523 16 13C16 12.4477 16.4477 12 17 12C17.5523 12 18 12.4477 18 13Z"
                                fill="#6486FF"
                              ></path>{" "}
                              <path
                                d="M13 17C13 17.5523 12.5523 18 12 18C11.4477 18 11 17.5523 11 17C11 16.4477 11.4477 16 12 16C12.5523 16 13 16.4477 13 17Z"
                                fill="#6486FF"
                              ></path>{" "}
                              <path
                                d="M13 13C13 13.5523 12.5523 14 12 14C11.4477 14 11 13.5523 11 13C11 12.4477 11.4477 12 12 12C12.5523 12 13 12.4477 13 13Z"
                                fill="#6486FF"
                              ></path>{" "}
                              <path
                                d="M8 17C8 17.5523 7.55228 18 7 18C6.44772 18 6 17.5523 6 17C6 16.4477 6.44772 16 7 16C7.55228 16 8 16.4477 8 17Z"
                                fill="#6486FF"
                              ></path>{" "}
                              <path
                                d="M8 13C8 13.5523 7.55228 14 7 14C6.44772 14 6 13.5523 6 13C6 12.4477 6.44772 12 7 12C7.55228 12 8 12.4477 8 13Z"
                                fill="#6486FF"
                              ></path>{" "}
                            </g>
                          </svg>
                          <span className="text-white text-[0.85rem]">
                            {format(
                              group_details?.createdAt as Date,
                              "MM/dd/yyyy"
                            )}
                          </span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Group Created At</p>
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
                        {group_details?.groupName}
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{group_details?.groupName}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <span className="text-slate-300 text-[0.7rem]">
                    {group_details?.is_group_active ? "Active Now" : `Offline`}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Member List */}
        <div className="flex-grow pt-16 px-2 profile-container w-full flex flex-col">
          <header className="flex justify-between items-center">
            <button
              onClick={() => {
                setMemberFilterStatus("active");
              }}
              className={`text-zinc-200 hover:bg-[#6486FF]/20 ${
                memberFilterStatus === "active" && "bg-[#6486FF]/20"
              } rounded-md w-full text-[0.9rem] font-bold py-1.5`}
            >
              Active
            </button>
            <button
              onClick={() => {
                setMemberFilterStatus("requesting");
              }}
              className={`text-zinc-200 hover:bg-[#6486FF]/20 ${
                memberFilterStatus === "requesting" && "bg-[#6486FF]/20"
              } rounded-md w-full text-[0.9rem] font-bold py-1.5`}
            >
              Requesting
            </button>
            <button
              onClick={() => {
                setMemberFilterStatus("pending");
              }}
              className={`text-zinc-200 hover:bg-[#6486FF]/20 ${
                memberFilterStatus === "pending" && "bg-[#6486FF]/20"
              } rounded-md w-full text-[0.9rem] font-bold py-1.5`}
            >
              Inviting
            </button>
          </header>
          <GroupMemberList
            groupId={groupId}
            queryStatus={getGroupDetails.isSuccess}
            memberFilterStatus={memberFilterStatus}
          />
        </div>

        {/* The Exit button */}
        <div className="flex items-center justify-center w-full absolute bottom-8">
          <button
            onClick={() => setOpenGroupDetailsModal((prev) => !prev)}
            className=" w-10 h-10 rounded-full bg-[#414141] text-[#6486FF] shadow-md flex items-center justify-center"
          >
            <MdOutlineTransitEnterexit />
          </button>
        </div>
      </div>
    </ParentDiv>
  );
}

export default GroupDetails;
