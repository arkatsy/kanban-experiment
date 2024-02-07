import { Settings as SettingsIcon, MoreVertical, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ResizablePanel } from "@/components/ui/resizable";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import useTheme from "@/hooks/useTheme";
import { Separator } from "./ui/separator";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";
import useWindowSize from "@/hooks/useWindowSize";

export default function Body() {
  const { width: windowWidth } = useWindowSize();
  const isNotDesktop = windowWidth < 650;
  return (
    <ResizablePanel>
      <div
        id="header"
        className="flex h-20 items-center justify-between border-b px-2 md:px-4 lg:px-6"
      >
        <h2 className="text-2xl font-semibold">Roadmap</h2>
        <div className="flex gap-2">
          <Button variant="secondary">{isNotDesktop ? <Plus /> : <span>New Task</span>}</Button>
          <Button variant="ghost" size="icon">
            <MoreVertical />
          </Button>
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
