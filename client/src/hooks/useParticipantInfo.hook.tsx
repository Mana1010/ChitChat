"use client";
import { useQuery, UseQueryResult } from "react-query";
import axios, { AxiosError } from "axios";
import { PRIVATE_SERVER_URL } from "@/utils/serverUrl";
import { GetParticipantInfo } from "@/types/user.types";
import { useSession } from "next-auth/react";
function useParticipantInfo(conversationId: string) {
  const { data: session, status } = useSession();
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
        `${PRIVATE_SERVER_URL}/participant/info/${session?.user.userId}/${conversationId}`
      );
      return response.data.message;
    },
    refetchOnWindowFocus: false,
    enabled: status === "authenticated",
  });
  return { participantInfo: data, isLoading };
}

export default useParticipantInfo;
