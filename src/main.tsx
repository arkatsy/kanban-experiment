import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import App from "@/app.tsx";
import "@/index.css";
import { ThemeProvider } from "@/context/theme.tsx";
import { Toaster } from "./components/ui/toaster";

// TODO: Add reduce motion for framer-motion animations and css transitions
ReactDOM.createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <App />
      <Toaster />
    </ThemeProvider>
  </StrictMode>,
);
