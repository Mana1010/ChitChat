import React, { useState } from "react";
import Image from "next/image";
import { MailDetailsSchema } from "@/types/app.types";
import invitationImg from "../../../../../assets/images/svg/invitation-img.svg";
import GroupChatInfo from "./InvitationGroupChatInfo";
import { AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import { capitalizeFirstLetter } from "@/utils/capitalizeFirstLetter";
import loadingIcon from "../../../../../assets/images/gif-animation/chat-loading.gif";
import useRequestResponse from "@/hooks/useRequestResponse";
import DeleteMailBtn from "./DeleteMailBtn";
import requestingImg from "../../../../../assets/images/svg/requesting-img.svg";
function InvitationText({
  getMailContent,
  mailId,
}: {
  getMailContent: MailDetailsSchema | undefined;
  mailId: string;
}) {
  const [showInfoModal, setShowInfoModal] = useState(false);
  const { data: session } = useSession();

  const {
    acceptRequest,
    declineRequest,
    acceptRequestLoading,
    declineRequestLoading,
  } = useRequestResponse(mailId);

  return (
    <div className="w-full flex flex-col relative text-white justify-center items-center">
      <div className="flex flex-col space-y-1 items-center">
        <Image
          src={requestingImg}
          alt="requesting-image"
          width={300}
          height={300}
          priority
        />
        <div className="w-1/2 space-y-2 flex flex-col relative">
          <div className="flex flex-col ">
            <h3 className="text-[0.9rem] font-bold">
              Someone wants to join in groupchat
            </h3>
            <div className="leading-6 text-[0.9rem] py-3 flex flex-col space-y-2">
              <span> Hi! 👋 </span>
              <span>
                {" "}
                I&apos;ve requested to join the group chat and am excited to
                connect once accepted. Thanks for considering my request! 😊
              </span>
            </div>
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
                getGroupInfo={getMailContent?.group_details}
                invitedBy={getMailContent?.inviter_details}
              />
            )}
          </AnimatePresence>
          <div className="self-center md:self-end">
            {getMailContent?.status === "pending" ? (
              <div className="flex space-x-2">
                <button
                  disabled={acceptRequestLoading}
                  onClick={() =>
                    acceptRequest({
                      groupId: getMailContent.group_details._id as string,
                      userId: session?.user.userId as string,
                    })
                  }
                  className="bg-[#6486FF] px-6 py-2 flex items-center justify-center rounded-sm text-white text-[0.9rem] disabled:bg-[#6486FF]/50"
                >
                  {acceptRequestLoading ? (
                    <Image
                      src={loadingIcon}
                      alt="loading-icon"
                      width={20}
                      height={20}
                      priority
                    />
                  ) : (
                    "Accept Request"
                  )}
                </button>
                <button
                  disabled={declineRequestLoading}
                  onClick={() =>
                    declineRequest({
                      groupId: getMailContent.group_details._id as string,
                      userId: session?.user.userId as string,
                    })
                  }
                  className="bg-[#414141] px-6 py-2 rounded-sm text-white text-[0.9rem] disabled:bg-[#6486FF]/50"
                >
                  {declineRequestLoading ? (
                    <Image
                      src={loadingIcon}
                      alt="loading-icon"
                      width={20}
                      height={20}
                      priority
                    />
                  ) : (
                    "Decline Request"
                  )}
                </button>
              </div>
            ) : (
              <div className="flex space-x-2">
                <button
                  disabled
                  className="bg-[#414141] px-3 py-2 rounded-sm text-white text-[0.9rem]"
                >
                  {capitalizeFirstLetter(getMailContent?.status)}
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
