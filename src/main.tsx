import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import App from "@/app.tsx";
import "@/index.css";
import { ThemeProvider } from "@/context/theme.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>,
);
