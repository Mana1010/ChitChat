"use client";
import React from "react";
import { useQuery, UseQueryResult } from "react-query";
import Image from "next/image";
import axios, { AxiosError } from "axios";
import { serverUrl } from "@/utils/serverUrl";
import { GetParticipantInfo } from "@/types/UserTypes";
import { User } from "@/types/UserTypes";
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
        `${serverUrl}/api/messages/participant-info/${sessionData?.user.userId}/conversation/${conversationId}`
      );
      return response.data.message;
    },
    enabled: status === "authenticated",
  });
  return { participantInfo: data, isLoading };
}

export default useGetParticipantInfo;
