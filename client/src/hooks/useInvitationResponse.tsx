"use client";

import React from "react";
import { useMutation } from "react-query";
import axios from "axios";
import { SHARED_SERVER_URL } from "@/utils/serverUrl";
import { useRouter } from "next/navigation";
import { useQueryClient } from "react-query";
import { useSocketStore } from "@/utils/store/socket.store";
import { toast } from "sonner";

function useInvitationResponse(optimisticUpdate: (groupId: string) => void) {
  const router = useRouter();
  const { groupSocket } = useSocketStore();
  const queryClient = useQueryClient();
  const acceptInvitation = useMutation({
    mutationFn: async ({
      groupId,
      userId,
    }: {
      groupId: string;
      userId: string;
    }) => {
      const response = await axios.patch(
        `${SHARED_SERVER_URL}/accept/invitation/${groupId}/${userId}`
      );
      return response.data;
    },
    onSuccess: ({ message, groupId }) => {
      groupSocket?.emit("invitation-accepted", { groupId });
      queryClient.invalidateQueries(["groupchat-list"]);
      toast.success(message);
      router.push(`/chats/group/${groupId}?type=chats`);
    },
  });
  const declineInvitation = useMutation({
    mutationFn: async ({
      groupId,
      userId,
    }: {
      groupId: string;
      userId: string;
    }) => {
      const response = await axios.patch(
        `${SHARED_SERVER_URL}/decline/invitation/${groupId}/${userId}`
      );
      return response.data;
    },
    onSuccess: ({ message, groupId }) => {
      toast.success(message);
      optimisticUpdate(groupId);
    },
  });
  return {
    acceptInvitation,
    declineInvitation,
    acceptInvitationLoading: acceptInvitation.isLoading,
    declineInvitationLoading: declineInvitation.isLoading,
  };
}

export default useInvitationResponse;
