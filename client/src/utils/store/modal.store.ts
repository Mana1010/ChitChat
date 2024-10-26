import { create, StoreApi } from "zustand";

interface ModalStoreState {
  showCreateGroupForm: boolean;
}

interface ModalStoreAction {
  setShowCreateGroupForm: (bool: boolean) => void;
}

type ModalStoreSchema = ModalStoreState & ModalStoreAction;
const store = (set: StoreApi<ModalStoreState>["setState"]) => ({
  showCreateGroupForm: false,
  setShowCreateGroupForm: (bool: boolean) => {
    set({ showCreateGroupForm: bool });
  },
});

export const useModalStore = create<ModalStoreSchema>(store);
