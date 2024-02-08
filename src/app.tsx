import { ResizablePanelGroup } from "@/components/ui/resizable";
import Sidebar from "@/components/features/sidebar/sidebar";
import Body from "@/components/features/body";

export default function App() {
  return (
    <Layout>
      <Sidebar />
      <Body />
    </Layout>
  );
}

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ResizablePanelGroup autoSaveId="persistence" className="min-h-dvh" direction="horizontal">
      {children}
    </ResizablePanelGroup>
  );
}
