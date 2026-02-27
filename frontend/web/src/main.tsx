import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { configureApi } from "@shared/api";
import "./i18n";
import "./styles/index.css";
import { App } from "./App";

if (import.meta.env.VITE_API_URL) {
  configureApi({ baseUrl: import.meta.env.VITE_API_URL });
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
