import "@fontsource/grenze-gotisch/latin-600.css";
import "@fontsource/im-fell-english/latin-400.css";
import "@fontsource/im-fell-english/latin-400-italic.css";
import "@fontsource/crimson-pro/400.css";
import "@fontsource/crimson-pro/600.css";
import "./styles/index.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./app/App";

const queryClient = new QueryClient({
  defaultOptions: { queries: { refetchOnWindowFocus: false } },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
);
