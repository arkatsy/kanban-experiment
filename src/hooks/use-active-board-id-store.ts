import { create } from "zustand";
import { persist } from "zustand/middleware";

type ActiveBoardIdStore = {
  activeBoardId: number | null;
  setActiveBoardId: (id: number) => void;
};

const useActiveBoardIdStore = create<ActiveBoardIdStore>()(
  persist(
    (set) => ({
      activeBoardId: null,
      setActiveBoardId: (id: number) => set((state) => ({ ...state, activeBoardId: id })),
    }),
    {
      name: "kanban-active-board-id",
    },
  ),
);

export default useActiveBoardIdStore;
