import axios from "axios";
import { useMutation } from "react-query";
import { SHARED_SERVER_URL } from "@/utils/serverUrl";
import { useQueryClient } from "react-query";
import { updateMailDetails } from "@/utils/sharedUpdateFunction";
import { toast } from "sonner";
function useRequestResponse(mailId: string) {
  const queryClient = useQueryClient();
  const { mutate: acceptRequest, isLoading: acceptRequestLoading } =
    useMutation({
      mutationFn: async ({
        groupId,
        userId,
      }: {
        groupId: string;
        userId: string;
      }) => {
        const response = await axios.patch(
          `${SHARED_SERVER_URL}/accept/request/${groupId}/${userId}`
        );
        return response.data.message;
      },
      onSuccess: (data) => {
        toast.success(data);
        updateMailDetails(queryClient, mailId, "accepted");
      },
    });

  const { mutate: declineRequest, isLoading: declineRequestLoading } =
    useMutation({
      mutationFn: async ({
        groupId,
        userId,
      }: {
        groupId: string;
        userId: string;
      }) => {
        const response = await axios.patch(
          `${SHARED_SERVER_URL}/decline/request/${groupId}/${userId}`
        );
        return response.data.message;
      },
      onSuccess: (data) => {
        toast.success(data);
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
