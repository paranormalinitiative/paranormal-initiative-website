import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { installDiagnostics } from "./lib/diagnostics";
import { App } from "./shell/App";
import "./styles.css";

installDiagnostics();

const container = document.getElementById("root");
if (!container) throw new Error("Nova root element is missing.");

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>
);
