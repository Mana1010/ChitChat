import { create, StoreApi } from "zustand";

interface ModalStoreState {
  showCreateGroupForm: boolean;
  showDialog: boolean;
}

interface ModalStoreAction {
  setShowCreateGroupForm: (bool: boolean) => void;
  setShowDialog: (bool: boolean) => void;
}

type ModalStoreSchema = ModalStoreState & ModalStoreAction;
const store = (set: StoreApi<ModalStoreState>["setState"]) => ({
  showCreateGroupForm: false,
  showDialog: false,
  setShowCreateGroupForm: (bool: boolean) => {
    set({ showCreateGroupForm: bool });
  },
  setShowDialog: (bool: boolean) => {
    set({ showDialog: bool });
  },
});

export const useModalStore = create<ModalStoreSchema>(store);
