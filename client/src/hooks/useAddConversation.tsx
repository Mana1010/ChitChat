import { useMutation, useQueryClient } from "react-query";
import { SHARED_SERVER_URL } from "@/utils/serverUrl";
import axios, { AxiosError } from "axios";
import { Socket } from "socket.io-client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
function useAddConversation(socket: Socket | null) {
  const queryClient = useQueryClient();
  const router = useRouter();

  const { mutate, isLoading } = useMutation({
    mutationFn: async (data: {
      senderId: string;
      receiverId: string;
      privateChatboardWallpaper: string;
    }) => {
      const response = await axios.post(`${SHARED_SERVER_URL}/new/chat`, data);
      return response.data;
    },
    onSuccess: ({ conversationId, is_already_chatting, senderId }) => {
      if (!socket) return;
      if (!is_already_chatting) {
        socket.emit("add-conversation", { conversationId, senderId });
        queryClient.invalidateQueries("chat-list");
        queryClient.invalidateQueries("sidebar");
      }
      router.push(`/chats/private/${conversationId}?type=chats`);
    },
    onError: (err: AxiosError<{ message: string }>) => {
      toast.error(err.response?.data.message);
    },
  });
  return { addConversation: mutate, addConversationIsLoading: isLoading };
}

export default useAddConversation;
