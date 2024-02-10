import { Settings as SettingsIcon, Plus, Trash2, Loader2, MoreVertical } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { ResizablePanel } from "@/components/ui/resizable";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import useTheme from "@/hooks/use-theme";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import useWindowSize from "@/hooks/use-window-size";
import useActiveBoardIdStore from "@/hooks/use-active-board-id-store";
import { useLiveQuery } from "dexie-react-hooks";
import { Board, db } from "@/db/db";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Body() {
  const { width: windowWidth } = useWindowSize();
  const { activeBoardId, setActiveBoardId } = useActiveBoardIdStore();
  const activeBoard = useLiveQuery(() => db.getBoard(activeBoardId || 0), [activeBoardId]);

  const isNotDesktop = windowWidth < 650;

  const onBoardDeletedSuccess = async (deletedBoard: Board) => {
    toast({
      title: "Board Deleted",
      description: `"${deletedBoard.title}" was deleted successfully`,
    });

    const firstBoard = await db.getFirstBoard();

    if (firstBoard) {
      setActiveBoardId(firstBoard.id);
      return;
    }

    setActiveBoardId(null);
  };

  const onBoardDeletedError = (error: string, undeletedBoard: Board) => {
    toast({
      title: `Error while deleting the board ${undeletedBoard.title}`,
      description: error,
    });
  };

  return (
    <ResizablePanel>
      <div
        id="header"
        className="flex h-20 items-center justify-between border-b px-2 md:px-4 lg:px-6"
      >
        <h2 className="text-2xl font-semibold">{activeBoard ? activeBoard.title : ""}</h2>
        <div className="flex gap-2">
          {activeBoard && (
            <Button variant="secondary">{isNotDesktop ? <Plus /> : <span>New Task</span>}</Button>
          )}
          {activeBoard && (
            <BoardSettings
              board={activeBoard}
              onDeleteError={onBoardDeletedError}
              onDeleteSuccess={onBoardDeletedSuccess}
            />
          )}
          <Settings asChild>
            <Button variant="ghost" size="icon">
              <SettingsIcon />
            </Button>
          </Settings>
        </div>
      </div>
      <div className="mt-5 px-2 md:px-4 lg:px-6">
        <Board />
      </div>
    </ResizablePanel>
  );
}

// TODO: Add more board specific settings
function BoardSettings({
  board,
  onDeleteSuccess,
  onDeleteError,
}: {
  board: Board;
  onDeleteSuccess: (board: Board) => void;
  onDeleteError: (error: string, board: Board) => void;
}) {
  // TODO: Prompt user to confirm deletion by typing the board's title
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // TODO: Needs more descriptive name
  const [isLoading, setIsLoading] = useState(false);

  const handleBoardDeletion = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();

    try {
      setIsLoading(true);
      await db.deleteBoard(board.id);
      onDeleteSuccess(board);
    } catch (error: unknown) {
      onDeleteError("Failed to delete board", board);
    } finally {
      setIsLoading(false);
      setIsDeleteDialogOpen(false);
    }
  };

  return (
    <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreVertical />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="p-0">
          <DropdownMenuItem className="p-0">
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="flex items-center gap-2">
                Delete Board
                <Trash2 className="size-5 text-destructive-foreground" />
              </Button>
            </AlertDialogTrigger>
          </DropdownMenuItem>
        </DropdownMenuContent>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Board</AlertDialogTitle>
            <AlertDialogDescription className="flex flex-col gap-1">
              <span>
                Are you sure you want to delete the board "
                <span className="font-semibold text-primary">{board.title}</span>"?
              </span>
              <span className="font-medium">This action is irreversible.</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className={cn(buttonVariants({ variant: "destructive" }))}
              onClick={handleBoardDeletion}
            >
              {isLoading ? (
                <div className="flex gap-1">
                  <Loader2 className="animate-spin" />
                  <span>Deleting</span>
                </div>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </DropdownMenu>
    </AlertDialog>
  );
}

// TODO: add more settings
function Settings({ children, asChild }: { children: React.ReactNode; asChild?: boolean }) {
  const { setTheme } = useTheme();

  const changeToLight = () => setTheme("light");
  const changeToDark = () => setTheme("dark");
  const changeToSystem = () => setTheme("system");

  return (
    <Dialog>
      <DialogTrigger asChild={asChild}>{children}</DialogTrigger>
      <DialogContent className="rounded-md">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>
        <Separator />
        <h3 className="text-lg font-semibold">Theme</h3>
        <RadioGroup defaultValue="system">
          <div className="flex items-center gap-2">
            <RadioGroupItem value="dark" id="dark-theme" onClick={changeToDark} />
            <Label htmlFor="dark-theme" className="text-md">
              Dark
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="light" id="light-theme" onClick={changeToLight} />
            <Label htmlFor="light-theme" className="text-md">
              Light
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="system" id="system-theme" onClick={changeToSystem} />
            <Label htmlFor="system-theme" className="text-md">
              System
            </Label>
          </div>
        </RadioGroup>
      </DialogContent>
    </Dialog>
  );
}

function Board() {
  return <div>Board</div>;
}
