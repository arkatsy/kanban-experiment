import { Dexie } from "dexie";
import testData from "./data";

export type Board = {
  id: number;
  title: string;
  columns: Column[];
};

export type Column = {
  name: string;
  tasks: Task[];
};

export type Task = {
  name: string;
  description: string;
};

class KanbanDB extends Dexie {
  boards!: Dexie.Table<Board, number>;
  constructor() {
    super("KanbanDB");
    this.version(1).stores({
      boards: "++id, title, isActive",
    });

    if (import.meta.env.NODE_ENV === "development") {
      this.__reset();
    }
  }

  async __reset() {
    await this.boards.clear();
    await this.boards.bulkAdd(testData as Board[]);
  }

  async getBoard(id: number) {
    const board = await this.boards.get(id);
    return board;
  }

  async getAllBoards() {
    const boards = await this.boards.toArray();
    return boards;
  }

  async newBoard(title: string): Promise<Board> {
    const id = await this.boards.add({ title, columns: [] } as unknown as Board);
    const board = (await this.boards.get(id)) as Board;
    return board;
  }
}

export const db = new KanbanDB();
