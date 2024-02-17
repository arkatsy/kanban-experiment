import { Dexie } from "dexie";
import testData from "./data";

export type Board = {
  id: number;
  title: string;
  columns: Column[];
};

export type Column = {
  name: string; // TODO: Make this unique by board
  tasks: Task[];
};

export type Task = {
  name: string;
  description: string;
};

class KanbanDB extends Dexie {
  // TODO: Normalize the data
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

  async deleteBoard(id: number) {
    await this.boards.delete(id);
  }

  async getFirstBoard() {
    // TODO: Make a proper query instead of fetching everything
    const board = await db.getAllBoards();
    return board[0];
  }

  async updateBoardTitle(id: number, title: string) {
    await this.boards.update(id, { title });
  }

  async newColumn(boardId: number, name: string) {
    const board = await this.boards.get(boardId);
    if (board) {
      const columns = board.columns;
      columns.push({ name, tasks: [] });
      await this.boards.update(boardId, { columns });
    }
  }

  async deleteColumn(boardId: number, columnIndex: number) {
    const board = await this.boards.get(boardId);
    if (board) {
      const columns = board.columns;
      columns.splice(columnIndex, 1);
      await this.boards.update(boardId, { columns });
    }
  }

  async newTask(boardId: number, columnName: string, task: Task) {
    const board = await this.boards.get(boardId);
    if (board) {
      const columns = board.columns;
      const columnIndex = columns.findIndex((col) => col.name === columnName);
      if (columnIndex !== -1) {
        columns[columnIndex].tasks.push(task);
        await this.boards.update(boardId, { columns });
      }
    }
  }

  async deleteTask(boardId: number, columnName: string, taskIndex: number) {
    const board = await this.boards.get(boardId);
    if (board) {
      const columns = board.columns;
      const columnIndex = columns.findIndex((col) => col.name === columnName);
      if (columnIndex !== -1) {
        columns[columnIndex].tasks.splice(taskIndex, 1);
        await this.boards.update(boardId, { columns });
      }
    }
  }
}

export const db = new KanbanDB();
