"use client";

import React, { Dispatch, SetStateAction } from "react";
import { useMutation } from "react-query";
import axios from "axios";
import { SHARED_SERVER_URL } from "@/utils/serverUrl";
import { useRouter } from "next/navigation";
import { useQueryClient } from "react-query";
import { useSocketStore } from "@/utils/store/socket.store";
import { toast } from "sonner";
import {
  updateMailDetails,
  updateGrouplist,
} from "@/utils/sharedUpdateFunction";
import { GroupChatConversationList, GroupChatList } from "@/types/group.types";

function useInvitationResponse(
  mailId: string | null,
  setAllGroupChatList: Dispatch<SetStateAction<GroupChatList[]>> | null = null,
  invitationType: "in-mail" | "in-group-list"
) {
  const router = useRouter();
  const { mailSocket, groupSocket } = useSocketStore();
  const queryClient = useQueryClient();
  const { mutate: acceptInvitation, isLoading: acceptInvitationLoading } =
    useMutation({
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
      onSuccess: ({ message, groupId, groupChatDetails }) => {
        if (invitationType === "in-mail" && mailSocket) {
          queryClient.invalidateQueries({ queryKey: ["groupchat-list"] });
          mailSocket.emit("invitation-accepted", { groupId, groupChatDetails });
        } else if (invitationType === "in-group-list" && groupSocket) {
          queryClient.setQueryData<GroupChatConversationList[] | undefined>(
            ["groupchat-list"],
            (cachedData) => {
              if (cachedData && groupChatDetails) {
                const data = cachedData || [];
                return [groupChatDetails, ...data];
              } else {
                return cachedData;
              }
            }
          );

          groupSocket.emit("invitation-accepted", {
            groupId,
            groupChatDetails,
          });
        }

        toast.success(message);
        router.push(`/chats/group/${groupId}?type=chats`);
      },
    });
  const { mutate: declineInvitation, isLoading: declineInvitationLoading } =
    useMutation({
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
        if (setAllGroupChatList === null && mailId) {
          updateMailDetails(queryClient, mailId, "declined");
        } else {
          updateGrouplist(
            groupId,
            setAllGroupChatList as Dispatch<SetStateAction<GroupChatList[]>>
          );
        }

        toast.success(message);
      },
    });
  return {
    acceptInvitation,
    declineInvitation,
    acceptInvitationLoading,
    declineInvitationLoading,
  };
}

export default useInvitationResponse;
