import axios from "axios";
import { useMutation } from "react-query";
import { SHARED_SERVER_URL } from "@/utils/serverUrl";
import { useQueryClient } from "react-query";
import { updateMailDetails } from "@/utils/sharedUpdateFunction";
import { toast } from "sonner";
import { useSocketStore } from "@/utils/store/socket.store";
function useRequestResponse(mailId: string) {
  const queryClient = useQueryClient();
  const { mailSocket } = useSocketStore();
  const { mutate: acceptRequest, isLoading: acceptRequestLoading } =
    useMutation({
      mutationFn: async ({
        groupId,
        userId,
        requesterId,
      }: {
        groupId: string;
        userId: string;
        requesterId: string;
      }) => {
        const response = await axios.patch(
          `${SHARED_SERVER_URL}/accept/request/${requesterId}/${groupId}/${userId}`
        );
        return response.data;
      },
      onSuccess: ({ groupId, requesterId, message, groupChatDetails }) => {
        toast.success(message);
        mailSocket?.emit("request-accepted", {
          requesterId,
          groupId,
          groupChatDetails,
        });
        updateMailDetails(queryClient, mailId, "accepted");
      },
    });

  const { mutate: declineRequest, isLoading: declineRequestLoading } =
    useMutation({
      mutationFn: async ({
        groupId,
        userId,
        requesterId,
      }: {
        groupId: string;
        userId: string;
        requesterId: string;
      }) => {
        const response = await axios.patch(
          `${SHARED_SERVER_URL}/decline/request/${requesterId}/${groupId}/${userId}`
        );
        return response.data;
      },
      onSuccess: ({ message }) => {
        toast.success(message);
        updateMailDetails(queryClient, mailId, "declined");
      },
    });
  return {
    acceptRequest,
    declineRequest,
    acceptRequestLoading,
    declineRequestLoading,
  };
}

export default useRequestResponse;
