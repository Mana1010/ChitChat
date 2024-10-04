import { create, StoreApi } from "zustand";
import { Conversation } from "@/types/UserTypes";
type ChatStore = {
  chatList: Conversation[];
  setUpdateChatList: (data: Conversation) => void;
};
const store = (set: StoreApi<ChatStore>["setState"]) => ({
  chatList: [],
  setUpdateChatList: () => ({}),
});

export const useChatStore = create<ChatStore>(store);
