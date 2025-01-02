import React, { ReactNode, useState } from "react";
import { useQuery, UseQueryResult } from "react-query";
import { MemberListSchema } from "@/types/group.types";
import axios, { AxiosError } from "axios";
import OnlyAdminAccess from "./OnlyAdminAccess";
import Skeleton from "../../../_components/Skeleton";
import ActiveMembers from "./MemberRole/ActiveMembers";
import RequestingMembers from "./MemberRole/RequestingMembers";
import InvitingMembers from "./MemberRole/InvitingMembers";
import { useSession } from "next-auth/react";
import { GROUP_SERVER_URL } from "@/utils/serverUrl";
import ConversationListSkeleton from "../../../_components/ConversationListSkeleton";

function GroupMemberList({
  groupId,
  queryStatus,
  memberFilterStatus,
}: {
  groupId: string;
  queryStatus: boolean;
  memberFilterStatus: "active" | "requesting" | "inviting";
}) {
  const { data: session, status } = useSession();
  const getAllMembers: UseQueryResult<
    MemberListSchema[],
    AxiosError<{ message: string }>
  > = useQuery({
    queryKey: ["member-list", memberFilterStatus, groupId],
    queryFn: async () => {
      const response = await axios.get(
        `${GROUP_SERVER_URL}/all/group/members/${groupId}/${session?.user.userId}?member_status=${memberFilterStatus}`
      );
      return response.data;
    },
    enabled: status === "authenticated" && queryStatus,
    refetchOnWindowFocus: false,
  });

  if (getAllMembers.isLoading) {
    return <ConversationListSkeleton />;
  }
  if (getAllMembers.isError) {
    const errorResponse = getAllMembers.error.response;
    if (errorResponse?.status === 403) {
      return <OnlyAdminAccess errorMessage={errorResponse.data.message} />;
    } else {
    }
  }
  return (
    <div className="flex space-y-2 flex-col items-center pt-5 overflow-y-auto w-full flex-grow">
      {getAllMembers.data?.map((member) => (
        <div key={member.member_details._id} className={`w-full`}>
          {memberFilterStatus === "active" ? (
            <ActiveMembers
              member_details={member.member_details}
              userId={session?.user.userId}
            />
          ) : memberFilterStatus === "requesting" ? (
            <RequestingMembers member_details={member.member_details} />
          ) : (
            <InvitingMembers member_details={member.member_details} />
          )}
        </div>
      ))}
    </div>
  );
}

export default GroupMemberList;
