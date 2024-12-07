import React, { useState } from "react";
import Image from "next/image";
import { MailDetailsSchema } from "@/types/app.types";
import invitationImg from "../../../../../assets/images/svg/invitation-img.svg";
import GroupChatInfo from "./InvitationGroupChatInfo";
import { AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import { capitalizeFirstLetter } from "@/utils/capitalizeFirstLetter";
import loadingIcon from "../../../../../assets/images/gif-animation/chat-loading.gif";
import useInvitationResponse from "@/hooks/useInvitationResponse";
import DeleteMailBtn from "./DeleteMailBtn";
import axios, { AxiosError } from "axios";
import { useQuery, UseQueryResult } from "react-query";
import { APP_SERVER_URL } from "@/utils/serverUrl";
import LoadingChat from "@/components/LoadingChat";
function InvitationText({ mailId }: { mailId: string }) {
  const [showInfoModal, setShowInfoModal] = useState(false);
  const { data: session, status } = useSession();
  const {
    acceptInvitation,
    declineInvitation,
    acceptInvitationLoading,
    declineInvitationLoading,
  } = useInvitationResponse(mailId);

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
    enabled: status === "authenticated",
  });
  if (getMailContent.isLoading) {
    return (
      <div className="w-full flex flex-col relative text-white justify-center items-center">
        <LoadingChat />
      </div>
    );
  }
  const getGroupDetails = getMailContent.data?.group_details;
  const inviterInfo = getMailContent.data?.sender_details;

  return (
    <div className="w-full flex flex-col relative text-white justify-center items-center">
      <div className="flex flex-col space-y-1 items-center">
        <Image
          src={invitationImg}
          alt="invitation-image"
          width={300}
          height={300}
          priority
        />
        <div className="w-1/2 space-y-2 flex flex-col relative">
          <div className="flex flex-col ">
            <h3 className="text-[0.9rem] font-bold">Join Our Group Chat!</h3>
            <span className="leading-6 text-[0.9rem] py-3">
              Hey there! 👋 We&apos;d love to have you join our group chat.
              It&apos;s a great place to connect, share ideas, and have some fun
              together! See the info below:
            </span>
            <button
              onMouseEnter={() => setShowInfoModal((prev) => !prev)}
              onMouseLeave={() => setShowInfoModal((prev) => !prev)}
              className="text-[#6486FF] text-[0.9rem] self-start hover:text-[#6486FF]/65 hover:underline hover:decoration-[#6486FF] underline-offset-2"
            >
              Hover to see info
            </button>
          </div>
          <AnimatePresence mode="wait">
            {showInfoModal && (
              <GroupChatInfo
                getGroupDetails={getGroupDetails}
                inviterInfo={inviterInfo}
              />
            )}
          </AnimatePresence>
          <div className="self-center md:self-end">
            {getMailContent.data?.status === "pending" ? (
              <div className="flex space-x-2">
                <button
                  disabled={acceptInvitationLoading}
                  onClick={() =>
                    acceptInvitation({
                      groupId: getGroupDetails?._id as string,
                      userId: session?.user.userId as string,
                    })
                  }
                  className="bg-[#6486FF] px-6 py-2 flex items-center justify-center rounded-sm text-white text-[0.9rem] disabled:bg-[#6486FF]/50"
                >
                  {acceptInvitationLoading ? (
                    <Image
                      src={loadingIcon}
                      alt="loading-icon"
                      width={20}
                      height={20}
                      priority
                    />
                  ) : (
                    "Accept Invitation"
                  )}
                </button>
                <button
                  disabled={declineInvitationLoading}
                  onClick={() =>
                    declineInvitation({
                      groupId: getGroupDetails?._id as string,
                      userId: session?.user.userId as string,
                    })
                  }
                  className="bg-[#414141] px-6 py-2 rounded-sm text-white text-[0.9rem] disabled:bg-[#6486FF]/50"
                >
                  {declineInvitationLoading ? (
                    <Image
                      src={loadingIcon}
                      alt="loading-icon"
                      width={20}
                      height={20}
                      priority
                    />
                  ) : (
                    "Decline Invitation"
                  )}
                </button>
              </div>
            ) : (
              <div className="flex space-x-2">
                <button
                  disabled
                  className="bg-[#414141] px-3 py-2 rounded-sm text-white text-[0.9rem]"
                >
                  {`${capitalizeFirstLetter(getMailContent.data?.status)}`}
                </button>
                <DeleteMailBtn mailId={mailId} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default InvitationText;
