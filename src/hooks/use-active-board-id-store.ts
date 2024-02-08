import { create } from "zustand";
import { persist } from "zustand/middleware";

type BoardId = number | null;

type ActiveBoardIdStore = {
  activeBoardId: BoardId;
  setActiveBoardId: (id: BoardId) => void;
};

const useActiveBoardIdStore = create<ActiveBoardIdStore>()(
  persist(
    (set) => ({
      activeBoardId: null,
      setActiveBoardId: (id: BoardId) => set((state) => ({ ...state, activeBoardId: id })),
    }),
    {
      name: "kanban-active-board-id",
    },
  ),
);

export default useActiveBoardIdStore;
