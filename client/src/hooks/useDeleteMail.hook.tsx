import React from "react";
import { useMutation, useQueryClient } from "react-query";
import axios, { AxiosError } from "axios";
import { toast } from "sonner";
import { APP_SERVER_URL } from "@/utils/serverUrl";
import { useRouter } from "next/navigation";

function useDeleteMail(mailId: string) {
  const router = useRouter();

  const queryClient = useQueryClient();
  const { mutate, isLoading } = useMutation({
    mutationFn: async () => {
      const response = await axios.delete(
        `${APP_SERVER_URL}/delete/single/mail/${mailId}`
      );
      return response.data.message;
    },
    onSuccess: (message) => {
      toast.success(message);
      router.push("/mailbox/mail");
      queryClient.invalidateQueries(["all-mail-list"]);
    },
    onError: (err: AxiosError<{ message: string }>) => {
      toast.error(err.response?.data.message);
    },
  });
  return { deleteMail: mutate, deleteMailLoading: isLoading };
}

export default useDeleteMail;
