import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Board, db } from "@/db/db";
import { cn } from "@/lib/utils";
import { Loader2, Plus } from "lucide-react";
import { useState } from "react";

type CreateNewBoardButtonProps = {
  isCollapsed: boolean;
  isDialogOpen: boolean;
  onOpenChange: (state: boolean) => void;
  onNewBoardSuccess?: (board: Board) => void;
  onNewBoardFail?: (error: string) => void;
};

export default function CreateNewBoardButton({
  isCollapsed,
  isDialogOpen,
  onOpenChange,
  onNewBoardSuccess,
  onNewBoardFail,
}: CreateNewBoardButtonProps) {
  // TODO: Combine the error & success into a single state
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [boardName, setBoardName] = useState("");

  // TODO: Change the loading state name to a more descriptive name
  const [isLoading, setIsLoading] = useState(false);

  const _onOpenChange = (state: boolean) => {
    if (!state) {
      setBoardName("");
      setError(null);
      setSuccess(null);
    }

    onOpenChange(state);
  };

  const handleInput = (e: React.FormEvent<HTMLInputElement>) => {
    const value = e.currentTarget.value;
    setBoardName(value);

    if (value === "") {
      setError(null);
      setSuccess(null);
      return;
    }

    const validation = isBoardNameValid(value);
    if (validation.type === "error") {
      setError(validation.message);
      setSuccess(null);
    } else {
      setError(null);
      setSuccess(validation.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const board = await db.newBoard(boardName);
      _onOpenChange(false);
      if (onNewBoardSuccess) onNewBoardSuccess(board);
    } catch (error: unknown) {
      if (onNewBoardFail) onNewBoardFail("Failed to create new board");
    } finally {
      setIsLoading(false);
    }
  };

  const shouldDisableCreateButton = error !== null || success === null;

  return (
    <Dialog open={isDialogOpen} onOpenChange={_onOpenChange}>
      <div className="px-2">
        <DialogTrigger asChild>
          <Button
            id="sidebar-create-new-board"
            className={cn("my-1 w-full py-2.5", isCollapsed && "size-12 w-full")}
          >
            {isCollapsed ? <Plus className="size-5" /> : "New board"}
          </Button>
        </DialogTrigger>
      </div>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create new Board</DialogTitle>
        </DialogHeader>
        <form className="flex flex-col gap-6 pt-3" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-3">
            <Label htmlFor="board-name">Board Name</Label>
            <div>
              <Input
                id="board-name"
                placeholder="Enter the name of your board"
                value={boardName}
                onInput={handleInput}
              />
              {error && <p className="mt-1.5 text-xs font-medium text-red-500">{error}</p>}
              {success && <p className="mt-1.5 text-xs font-medium text-green-500">{success}</p>}
            </div>
          </div>
          <DialogFooter className="gap-3 sm:justify-between">
            <Button type="button" onClick={() => _onOpenChange(true)} variant="secondary">
              Cancel
            </Button>
            <Button type="submit" disabled={shouldDisableCreateButton}>
              {isLoading ? (
                <div className="flex items-center gap-1">
                  <Loader2 className="-mt-0.5 size-4 animate-spin" />
                  <span>Creating...</span>
                </div>
              ) : (
                "Create Board"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

const CHARACTER_LENGTH_MESSAGE = "Board name must be between 3 and 30 characters";
const SPECIAL_CHARACTERS_MESSAGE = "Board name can only contain letters, numbers, and spaces";
const EMPTY_MESSAGE = "Board name cannot be empty";
const SUCCESS_MESSAGE = "Board name is valid";

type ValidationMessage = {
  type: "error" | "success";
  message: string;
};

function isBoardNameValid(name: string): ValidationMessage {
  // Rules:
  // - At least 3 characters
  // - At most 30 characters
  // - No special characters (only letters, numbers, and spaces)
  if (name.length < 3 || name.length > 30) {
    return { type: "error", message: CHARACTER_LENGTH_MESSAGE };
  }

  if (!/^[a-zA-Z0-9 ]+$/.test(name)) {
    return { type: "error", message: SPECIAL_CHARACTERS_MESSAGE };
  }

  if (name.trim().length === 0) {
    return { type: "error", message: EMPTY_MESSAGE };
  }

  return { type: "success", message: SUCCESS_MESSAGE };
}

if (import.meta.vitest) {
  const { test, expect } = import.meta.vitest;

  test("isBoardNameValid should validate the board name properly", () => {
    expect(isBoardNameValid("")).toStrictEqual<ValidationMessage>({
      type: "error",
      message: CHARACTER_LENGTH_MESSAGE,
    });
    expect(isBoardNameValid("a")).toStrictEqual<ValidationMessage>({
      type: "error",
      message: CHARACTER_LENGTH_MESSAGE,
    });
    expect(isBoardNameValid("ab")).toStrictEqual<ValidationMessage>({
      type: "error",
      message: CHARACTER_LENGTH_MESSAGE,
    });
    expect(isBoardNameValid("a b")).toStrictEqual<ValidationMessage>({
      type: "error",
      message: CHARACTER_LENGTH_MESSAGE,
    });
    expect(isBoardNameValid("a bcd")).toStrictEqual<ValidationMessage>({
      type: "success",
      message: SUCCESS_MESSAGE,
    });
    expect(isBoardNameValid("@abcd d")).toStrictEqual<ValidationMessage>({
      type: "error",
      message: SPECIAL_CHARACTERS_MESSAGE,
    });
    expect(isBoardNameValid("a bcd e")).toStrictEqual<ValidationMessage>({
      type: "success",
      message: SUCCESS_MESSAGE,
    });
    expect(isBoardNameValid("100203f3")).toStrictEqual<ValidationMessage>({
      type: "success",
      message: SUCCESS_MESSAGE,
    });
  });
}
