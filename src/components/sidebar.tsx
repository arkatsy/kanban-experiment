import { useEffect, useRef, useState } from "react";
import { FolderKanban, LayoutDashboard, Plus } from "lucide-react";
import { LayoutGroup, motion } from "framer-motion";
import { ResizableHandle, ResizablePanel } from "@/components/ui/resizable";
import { type ImperativePanelHandle } from "react-resizable-panels";
import { cn } from "@/lib/utils";
import useWindowSize from "@/hooks/useWindowSize";
import { Button } from "./ui/button";

const TEST_BOARDS_LENGTH = 4;

const TESTING_BOARDS = Array.from({ length: TEST_BOARDS_LENGTH }, (_, index) => ({
  id: index + 1,
  title: `Board ${index + 1}`,
}));

// TODO: Replace with real data from the db
export default function Sidebar() {
  const { width: windowWidth } = useWindowSize();
  const ref = useRef<ImperativePanelHandle>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeBoard, setActiveBoard] = useState(1);
  const [showHandle, setShowHandle] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    if (windowWidth < 550) {
      ref.current.collapse();
      setShowHandle(false);
    } else setShowHandle(true);
  }, [windowWidth]);

  // TODO: Depending on the windowWidth, the sidebar should have different min, max, default sizes
  const sidebarMaxSize = 35;
  const sidebarMinSize = 12;
  const sidebarDefaultSize = 20;
  const sidebarCollapsedSize = 3;

  return (
    <>
      <ResizablePanel
        id="sidebar"
        ref={ref}
        minSize={sidebarMinSize}
        maxSize={sidebarMaxSize}
        collapsible={true}
        collapsedSize={sidebarCollapsedSize}
        defaultSize={sidebarDefaultSize}
        onCollapse={() => setIsCollapsed(true)}
        onExpand={() => setIsCollapsed(false)}
        className={cn(
          "relative",
          isCollapsed && "h-full min-w-[80px] transition-all duration-300 ease-in-out",
        )}
      >
        <Logo isSidebarCollapsed={isCollapsed} />
        {!isCollapsed && (
          <div
            id="sidebar-boards-number"
            className={cn(
              "my-2 flex select-none justify-center text-xs font-medium text-primary/50",
            )}
          >
            <span>
              ALL BOARDS (<span className="font-semibold">{TESTING_BOARDS.length}</span>)
            </span>
          </div>
        )}
        <LayoutGroup>
          <div
            id="sidebar-boards-list"
            className="flex h-[calc(100dvh-108px)] flex-col gap-1 overflow-hidden overflow-y-auto px-2 pt-1"
          >
            {TESTING_BOARDS.map((board) => (
              <div id="sidebar-board-button" className="relative" key={board.id}>
                <button
                  className={cn(
                    "flex w-full justify-start gap-4 rounded-md px-4 py-2.5 hover:bg-secondary",
                    isCollapsed && "size-12 w-full",
                    activeBoard === board.id && "hover:bg-transparent",
                  )}
                  onClick={() => setActiveBoard(board.id)}
                >
                  <FolderKanban
                    className={cn(
                      "absolute size-5",
                      isCollapsed && "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform",
                    )}
                  />
                  {!isCollapsed && (
                    <span className="ml-7 overflow-hidden overflow-ellipsis whitespace-nowrap text-sm">
                      {board.title}
                    </span>
                  )}
                </button>
                {activeBoard === board.id && (
                  <motion.div
                    className="absolute inset-0 -z-10 rounded-md bg-accent"
                    layoutId="active-board"
                    transition={{
                      type: "spring",
                      stiffness: 500,
                      damping: 30,
                    }}
                  />
                )}
              </div>
            ))}
            <Button
              id="sidebar-create-new-board"
              className={cn("mt-1 px-2 py-2.5", isCollapsed && "size-12 w-full")}
            >
              {isCollapsed ? <Plus className="size-5" /> : "New board"}
            </Button>
          </div>
        </LayoutGroup>
      </ResizablePanel>
      <ResizableHandle withHandle={showHandle} />
    </>
  );
}

function Logo({ isSidebarCollapsed }: { isSidebarCollapsed: boolean }) {
  return (
    <a
      href="/"
      className={cn(
        "relative flex w-full select-none gap-3 p-4",
        isSidebarCollapsed && "justify-center",
      )}
    >
      <LayoutDashboard className="size-8 fill-rose-400 stroke-[2] text-rose-400" />
      {!isSidebarCollapsed && (
        <span className="absolute ml-10 mt-0.5 text-2xl font-bold">Kanban</span>
      )}
    </a>
  );
}
