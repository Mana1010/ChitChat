"use client";
import React from "react";
import { useQuery, UseQueryResult } from "react-query";
import axios, { AxiosError } from "axios";
import { GROUP_SERVER_URL, PRIVATE_SERVER_URL } from "@/utils/serverUrl";
import { GetParticipantInfo } from "@/types/UserTypes";
import { Session } from "next-auth";
function useGroupInfo(groupId: string, status: string) {
  const {
    data,
    isLoading,
  }: UseQueryResult<
    GetParticipantInfo,
    AxiosError<{ message: string }>
  > = useQuery({
    queryKey: ["group-info", groupId],
    queryFn: async () => {
      const response = await axios.get(
        `${GROUP_SERVER_URL}/group/info/${groupId}`
      );
      return response.data.message;
    },
    enabled: status === "authenticated",
  });
  return { groupInfo: data, isLoading };
}

export default useGroupInfo;
