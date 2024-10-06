"use client";
import React, { Dispatch, SetStateAction } from "react";
import { useQueryClient } from "react-query";
import { MdOutlineTransitEnterexit } from "react-icons/md";
import Image from "next/image";
import { GetParticipantInfo } from "@/types/UserTypes";
import { FcGoogle } from "react-icons/fc";
function ProfileCard({
  conversationId,
  setOpenProfileModal,
}: {
  conversationId: string;
  setOpenProfileModal: Dispatch<SetStateAction<boolean>>;
}) {
  const queryClient = useQueryClient();
  const getParticipantInfo: GetParticipantInfo | undefined =
    queryClient.getQueryData(["participant-info", conversationId]);
  const profileName = getParticipantInfo?.receiver_details.provider;
  return (
    <div className="w-full flex justify-end items-end bg-black/30 absolute inset-0 z-50 h-full">
      <div className=" w-[300px] bg-[#222222] h-full">
        <div className="w-full flex items-center justify-center flex-col space-y-3 py-3 px-2 h-full relative">
          <div className="w-16 h-16 relative rounded-full border-[#6486FF] border-2">
            <Image
              src={getParticipantInfo?.receiver_details.profilePic as string}
              alt={`${getParticipantInfo?.receiver_details.name}'s profile picture`}
              sizes="100%"
              fill
              className="absolute rounded-full"
              priority
            />
          </div>
          {/* Profile Name */}
          <h3 className="font-bold text-[#6486FF] text-lg text-center">
            {getParticipantInfo?.receiver_details.name}
          </h3>
          {/* Profile Provider */}
          <div className="px-3 py-2 flex space-x-2 rounded-md text-white bg-[#414141] items-center">
            <span>
              <FcGoogle />
            </span>{" "}
            <span className="text-sm">
              {`${profileName?.charAt(0).toUpperCase()}${profileName?.slice(
                1
              )}`}
            </span>
          </div>
          {/* Profile Email */}
          <h5 className="text-white text-center text-[0.8rem]">
            {getParticipantInfo?.receiver_details.email}
          </h5>
          <small className="text-white text-[0.7rem] text-center">
            I love dancing, singing and so on! sdsdsdsdsdsddsdsdddsds
          </small>
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
      </div>
    </div>
  );
}

export default ProfileCard;
