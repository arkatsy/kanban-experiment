import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Grip, Plus } from "lucide-react";
import { forwardRef, useEffect, useRef, useState } from "react";
import Sortable from "sortablejs";

type Task = {
  id: string;
  content: string;
};

type Column = {
  id: string;
  name: string;
  tasks: Task[];
};

const initData: Column[] = [
  {
    id: "col-1",
    name: "To Do",
    tasks: [
      { id: "task-1", content: "Task 1" },
      { id: "task-2", content: "Task 2" },
    ],
  },
  { id: "col-2", name: "In Progress", tasks: [{ id: "task-3", content: "Task 3" }] },
  {
    id: "col-3",
    name: "Done",
    tasks: [
      { id: "task-4", content: "Task 4" },
      { id: "task-5", content: "Task 5" },
    ],
  },
  {
    id: "col-4",
    name: "Rejected",
    tasks: [
      { id: "task-6", content: "Task 6" },
      { id: "task-7", content: "Task 7" },
    ],
  },
  {
    id: "col-5",
    name: "Backlog",
    tasks: [
      { id: "task-8", content: "Task 8" },
      { id: "task-9", content: "Task 9" },
    ],
  },
  {
    id: "col-6",
    name: "Meta",
    tasks: [
      { id: "task-10", content: "Task 10" },
      { id: "task-11", content: "Task 11" },
    ],
  },
];

export default function Board() {
  // TODO: Persist the x-scroll position when refreshing
  // TODO: Make the column titles editable (see body - board title component)
  // TODO: Make columns reorderable in the x axis
  // TODO: Create a separate component for the columns
  // TODO: Create Tasks UI
  // TODO: Make tasks draggable and droppable in both the same column & other columns
  // TODO: Add dialog to create new column
  // TODO: Fix first column left margin when dragging / dropping

  const colsRef = useRef<HTMLDivElement>(null);
  const [data, setData] = useState<Column[]>(initData);

  useEffect(() => {
    const cols = colsRef.current;
    if (!cols) return;

    const sortable = Sortable.create(cols, {
      handle: ".grip",
      animation: 150,
      onEnd: (evt) => {
        console.log(evt);
        const sourceIdx = evt.oldIndex!;
        const targetIdx = evt.newIndex!;
        if (sourceIdx === targetIdx) return;
        console.log(sourceIdx, targetIdx);
        setData((prev) => {
          const copy = [...prev];
          const [removed] = copy.splice(sourceIdx, 1);
          copy.splice(targetIdx, 0, removed);
          return copy;
        });
      },
    });
  }, []);

  return (
    <div
      id="board"
      ref={colsRef}
      className="my-4 flex h-[calc(100dvh-96px-16px)] gap-4 overflow-x-auto mx-4"
      style={{
        scrollbarWidth: "none",
      }}
    >
      {data.map((col, idx) => (
        <Column key={col.id} col={col} isFirst={idx === 0} />
      ))}
      <Column isLast />
    </div>
  );
}

// TODO: Improve types for ColumnProps or separate the last column into its own component
type ColumnProps = {
  col?: Column;
  isFirst?: boolean;
  isLast?: boolean;
};

const Column = forwardRef<HTMLDivElement, ColumnProps>(
  ({ col, isFirst = false, isLast = false }, ref) => {
    if (isLast) {
      return (
        <button className="mr-4 flex min-w-96 items-center justify-center rounded-lg bg-primary-foreground p-5">
          <div className="flex items-center justify-center gap-2 text-xl font-medium text-muted-foreground">
            <Plus />
            <span>New Column</span>
          </div>
        </button>
      );
    }

    if (!col) {
      throw new Error("Column Prop is required");
    }

    return (
      <div
        ref={ref}
        className={cn("min-w-96 rounded-lg bg-primary-foreground p-5", isFirst && "ml-4")}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold">{col.name}</h3>
          <Grip className="grip text-primary/20 cursor-move" />
        </div>
        <Separator className="my-3" />
        <div>
          {col.tasks.map((task) => (
            <div
              key={task.id}
              draggable={true}
              className="my-2 cursor-pointer rounded-md bg-secondary px-4 py-6"
            >
              <h4 className="font-semibold">{task.content}</h4>
            </div>
          ))}
        </div>
      </div>
    );
  },
);
