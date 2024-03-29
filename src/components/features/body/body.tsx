import {
  Settings as SettingsIcon,
  Plus,
  Trash2,
  Loader2,
  MoreVertical,
  SquarePen,
  X,
  Check,
} from "lucide-react";
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
import { type Board as TBoard, db } from "@/db/db";
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
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import FocusTrap from "focus-trap-react";
import Board from "./board";
import Spinner from "@/components/features/spinner";

export default function Body() {
  const { width: windowWidth } = useWindowSize();
  const { activeBoardId, setActiveBoardId } = useActiveBoardIdStore();
  const activeBoard = useLiveQuery(() => db.getBoard(activeBoardId || 0), [activeBoardId]);

  const isNotDesktop = windowWidth < 650;

  const onBoardDeletedSuccess = async (deletedBoard: TBoard) => {
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

  const onBoardDeletedError = (error: string, undeletedBoard: TBoard) => {
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
        {activeBoard && <BoardTitle />}
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
      <Board />
    </ResizablePanel>
  );
}

function BoardTitle() {
  // TODO: Abstract the title with the edit mode to a separate component (needed for the board columns)
  const activeBoardId = useActiveBoardIdStore((state) => state.activeBoardId);
  const board = useLiveQuery(() => db.getBoard(activeBoardId || 0), [activeBoardId]);

  const [isEdit, setIsEdit] = useState(false);
  const [title, setTitle] = useState(board ? board.title : "");
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (board) {
      setTitle(board.title);
    }
  }, [board]);

  // TODO: When going to edit mode, the title should be selected
  const startEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsEdit(true);
  };

  const endEdit = () => setIsEdit(false);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value);

  const submitNewTitle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!board) return;

    if (title === board.title) {
      endEdit();
      return;
    }

    try {
      await db.updateBoardTitle(board.id, title);
      toast({
        title: "Board Title Updated",
        description: "Board title was updated successfully",
      });
    } catch (error: unknown) {
      toast({
        title: "Error while updating the board title",
        description: "Failed to update the board title",
      });
    } finally {
      endEdit();
    }
  };

  useEffect(() => {
    const handleFormKeydown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        endEdit();
      }
    };

    // TODO: Extract to a useOutsideClick hook
    const handleOutsideClick = (e: MouseEvent) => {
      if (formRef.current && !formRef.current.contains(e.target as Node)) {
        endEdit();
      }
    };

    if (isEdit) {
      window.addEventListener("keydown", handleFormKeydown);

      // The click event that goes into edit mode is also caught by the outside click event here resulting
      // in the handleOutsideClick being called which then results in closing the edit mode immediately.
      // The small delay is a workaround for that.
      setTimeout(() => {
        window.addEventListener("click", handleOutsideClick);
      }, 100);

      return () => {
        window.removeEventListener("keydown", handleFormKeydown);
        window.removeEventListener("click", handleOutsideClick);
      };
    }
  }, [isEdit]);

  if (!board) return <Spinner />;

  if (isEdit) {
    return (
      <form ref={formRef} onSubmit={submitNewTitle}>
        <FocusTrap
          focusTrapOptions={{
            allowOutsideClick: true,
          }}
        >
          <div className="flex items-center gap-2">
            <Input
              autoFocus
              value={title}
              onChange={handleTitleChange}
              className="h-10 text-2xl font-semibold"
            />
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" type="submit">
                <Check />
              </Button>
              <Button variant="ghost" size="icon">
                <X />
              </Button>
            </div>
          </div>
        </FocusTrap>
      </form>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {/*
        TODO: It'd be better for it to be on triple click. (or maybe single click ??)
        See https://stackoverflow.com/questions/6480060/how-do-i-listen-for-triple-clicks-in-javascript 
      */}
      <h2 className="text-2xl font-semibold" onDoubleClick={startEdit}>
        {board.title}
      </h2>
      <Button variant="ghost" size="icon" onClick={startEdit}>
        <SquarePen />
      </Button>
    </div>
  );
}

// TODO: Add more board specific settings
function BoardSettings({
  board,
  onDeleteSuccess,
  onDeleteError,
}: {
  board: TBoard;
  onDeleteSuccess: (board: TBoard) => void;
  onDeleteError: (error: string, board: TBoard) => void;
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
