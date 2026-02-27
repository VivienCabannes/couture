import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, HashRouter } from "react-router-dom";
import { configureApi } from "@shared/api";
import "./i18n";
import "./styles/index.css";
import { App } from "./App";

if (import.meta.env.VITE_API_URL) {
  configureApi({ baseUrl: import.meta.env.VITE_API_URL });
}

// Tauri serves the frontend from the filesystem, so BrowserRouter
// won't work in production builds. HashRouter handles this correctly.
const isTauri = "__TAURI_INTERNALS__" in window;
const Router = isTauri ? HashRouter : BrowserRouter;

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Router>
      <App />
    </Router>
  </StrictMode>,
);
