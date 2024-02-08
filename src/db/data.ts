import type { Board } from "./db";

const data: Omit<Board, "id">[] = [
  { title: "Platform Launch", columns: [] },
  { title: "Marketing Plan", columns: [] },
  { title: "Roadmap", columns: [] },
  { title: "Meetings", columns: [] },
  { title: "Future Ideas", columns: [] },
  { title: "Testing", columns: [] },
];

export default data;
