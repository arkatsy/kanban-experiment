import { ResizablePanelGroup } from "@/components/ui/resizable";
import Sidebar from "@/components/sidebar";
import Body from "@/components/body";

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
    <ResizablePanelGroup className="min-h-screen" direction="horizontal">
      {children}
    </ResizablePanelGroup>
  );
}
