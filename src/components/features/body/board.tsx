import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Grip, Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
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
  // TODO: Make the board scrollable in the x-axis with mouse wheel
  // TODO: Add a setting to show / hide scrollbars
  // TODO: Make the whole column droppable
  // TODO: Move the board data to a state management solution
  // TODO: Make animation duration consistent throught the app
  // TODO: Add reduced motion. (see main.tsx)

  const colsRef = useRef<HTMLDivElement>(null);
  const [data, setData] = useState<Column[]>(initData);

  useEffect(() => {
    const cols = colsRef.current;
    if (!cols) return;

    const columnsSortable = Sortable.create(cols, {
      group: "columns",
      handle: ".column-grip",
      easing: "ease-out",
      animation: 250,
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

    return () => {
      columnsSortable.destroy();
    };
  });

  return (
    <div
      id="board"
      ref={colsRef}
      className="mx-4 my-4 flex h-[calc(100dvh-96px-16px)] gap-4 overflow-x-auto"
      style={{
        scrollbarWidth: "none",
      }}
    >
      {data.map((col) => (
        <Column key={col.id}>
          <Column.Header>
            <Column.Name>{col.name}</Column.Name>
            <Column.Handle className="column-grip" />
          </Column.Header>
          <Column.Tasks>
            {col.tasks.map((task) => (
              <div
                key={task.id}
                draggable={true}
                className="my-2 cursor-pointer rounded-md bg-secondary px-4 py-6"
              >
                <h4 className="font-semibold">{task.content}</h4>
              </div>
            ))}
          </Column.Tasks>
        </Column>
      ))}
      <button className="flex min-w-96 items-center justify-center rounded-lg bg-primary-foreground p-5">
        <div className="flex items-center justify-center gap-2 text-xl font-medium text-muted-foreground">
          <Plus />
          <span>New Column</span>
        </div>
      </button>
    </div>
  );
}

function Column({ children }: { children: React.ReactNode }) {
  return <div className="min-w-96 rounded-lg bg-primary-foreground p-5">{children}</div>;
}

function Handle({ className }: { className?: string }) {
  return <Grip className={cn("cursor-move text-primary/20", className)} />;
}

function Name({ className, children }: { className?: string; children: React.ReactNode }) {
  return <h3 className={cn("text-xl font-semibold", className)}>{children}</h3>;
}

function Header({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center justify-between">{children}</div>
      <Separator className="my-3" />
    </div>
  );
}

const Tasks = ({ children }: { children: React.ReactNode }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tasks = ref.current;
    if (!tasks) return;
    const tasksSortable = Sortable.create(tasks, {
      group: "tasks",
      animation: 250,
      fallbackOnBody: true,
      easing: "ease-out",
      onEnd: console.log,
    });

    return () => {
      tasksSortable.destroy();
    };
  }, []);

  return (
    <div ref={ref} className="h-[calc(100dvh-200px)] select-none">
      {children}
    </div>
  );
};

Column.Header = Header;
Column.Name = Name;
Column.Handle = Handle;
Column.Tasks = Tasks;
