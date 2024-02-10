import { Button } from "@/components/ui/button";
import { ResizableHandle, ResizablePanel } from "@/components/ui/resizable";
import { toast } from "@/components/ui/use-toast";
import { Board, db } from "@/db/db";
import useWindowSize from "@/hooks/use-window-size";
import { cn } from "@/lib/utils";
import { useLiveQuery } from "dexie-react-hooks";
import { LayoutGroup, motion } from "framer-motion";
import { FolderKanban, LayoutDashboard } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { type ImperativePanelHandle } from "react-resizable-panels";
import CreateNewBoardButton from "@/components/features/sidebar/create-new-board-button";
import useActiveBoardIdStore from "@/hooks/use-active-board-id-store";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import Spinner from "@/components/features/spinner";

export default function Sidebar() {
  const { width: windowWidth } = useWindowSize();
  const ref = useRef<ImperativePanelHandle>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showHandle, setShowHandle] = useState(false);

  // TODO: dialog state is not necessary anymore here, should be managed by the BoardsList component
  const [isNewBoardDialogOpen, setIsNewBoardDialogOpen] = useState(false);

  const setActiveBoardId = useActiveBoardIdStore((state) => state.setActiveBoardId);
  const boards = useLiveQuery(() => db.getAllBoards());

  useEffect(() => {
    if (!ref.current) return;
    if (windowWidth < 550) {
      ref.current.collapse();
      setShowHandle(false);
    } else setShowHandle(true);
  }, [windowWidth]);

  // TODO: Descriptions that are comming from other components should be more consistent. See also Body component (delete board)
  // TODO: On board creation success the focus should be on the new board, not the button creation.
  const onNewBoardSuccess = (board: Board) => {
    setActiveBoardId(board.id);
    toast({
      title: "Board created",
      description: `Board "${board.title}" has been created successfully.`,
    });
  };

  const onNewBoardFail = (error: string) => {
    toast({
      title: "Board creation failed",
      description: error,
    });
  };

  return (
    <>
      <ResizablePanel
        id="sidebar"
        ref={ref}
        minSize={12}
        maxSize={35}
        collapsible={true}
        collapsedSize={3}
        defaultSize={20}
        onCollapse={() => setIsCollapsed(true)}
        onExpand={() => setIsCollapsed(false)}
        className={cn(
          "relative min-w-[200px]",
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
              ALL BOARDS (<span className="font-semibold">{boards && boards.length}</span>)
            </span>
          </div>
        )}
        <BoardsList isCollapsed={isCollapsed}>
          <div className="mt-0.5">
            <CreateNewBoardButton
              isCollapsed={isCollapsed}
              isDialogOpen={isNewBoardDialogOpen}
              onOpenChange={setIsNewBoardDialogOpen}
              onNewBoardSuccess={onNewBoardSuccess}
              onNewBoardFail={onNewBoardFail}
            />
          </div>
        </BoardsList>
      </ResizablePanel>
      <ResizableHandle withHandle={showHandle} />
    </>
  );
}

type BoardsListProps = {
  isCollapsed: boolean;
  children: React.ReactNode;
};

function BoardsList({ isCollapsed, children }: BoardsListProps) {
  const boards = useLiveQuery(() => db.getAllBoards());
  const { activeBoardId, setActiveBoardId } = useActiveBoardIdStore();

  useEffect(() => {
    if (boards === undefined || boards.length === 0) return;
    if (activeBoardId === null) setActiveBoardId(boards[0].id);
  }, [activeBoardId, boards, setActiveBoardId]);

  if (boards === undefined || activeBoardId === undefined)
    return (
      <div className="flex items-center justify-center">
        <Spinner />
      </div>
    );

  const handleBoardClick = async (boardId: number) => {
    setActiveBoardId(boardId);
  };

  return (
    <TooltipProvider delayDuration={0} disableHoverableContent>
      <LayoutGroup>
        <div
          id="sidebar-boards-list"
          className="flex max-h-[calc(100dvh-150px)] flex-col gap-1 overflow-hidden overflow-y-auto px-2 py-1"
          style={{
            scrollbarWidth: "none",
          }}
        >
          {boards.map((board) => (
            <div
              id="sidebar-board-button"
              className="relative"
              style={{
                scrollbarWidth: "none",
              }}
              key={board.id}
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    className={cn(
                      "flex w-full justify-start gap-4 rounded-md px-4 py-2.5 hover:bg-secondary/50",
                      isCollapsed && "size-12 w-full",
                      activeBoardId === board.id && "hover:bg-transparent",
                    )}
                    onClick={() => handleBoardClick(board.id)}
                  >
                    <FolderKanban
                      className={cn(
                        "absolute size-5",
                        isCollapsed &&
                          "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform",
                      )}
                    />
                    {!isCollapsed && (
                      <span className="ml-7 overflow-hidden overflow-ellipsis whitespace-nowrap text-sm">
                        {board.title}
                      </span>
                    )}
                  </Button>
                </TooltipTrigger>
                {isCollapsed && <TooltipContent>{board.title}</TooltipContent>}
              </Tooltip>
              {activeBoardId === board.id && (
                <motion.div
                  className="absolute inset-0 -z-10 rounded-md bg-accent"
                  layoutId="active-board"
                  transition={{
                    duration: 0.2,
                  }}
                />
              )}
            </div>
          ))}
        </div>
        {children}
      </LayoutGroup>
    </TooltipProvider>
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
