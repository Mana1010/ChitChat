"use client";
import React from "react";
import { useQuery, UseQueryResult } from "react-query";
import axios, { AxiosError } from "axios";
import { serverUrl, PRIVATE_SERVER_URL } from "@/utils/serverUrl";
import { GetParticipantInfo } from "@/types/UserTypes";
import { Session } from "next-auth";
function useGetParticipantInfo(
  conversationId: string,
  status: string,
  sessionData: Session | null
) {
  const {
    data,
    isLoading,
  }: UseQueryResult<
    GetParticipantInfo,
    AxiosError<{ message: string }>
  > = useQuery({
    queryKey: ["participant-info", conversationId],
    queryFn: async () => {
      const response = await axios.get(
        `${PRIVATE_SERVER_URL}/participant/info/${sessionData?.user.userId}/${conversationId}`
      );
      return response.data.message;
    },
    enabled: status === "authenticated",
  });
  return { participantInfo: data, isLoading };
}

export default useGetParticipantInfo;
