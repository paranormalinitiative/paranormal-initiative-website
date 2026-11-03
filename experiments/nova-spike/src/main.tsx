import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { DocumentSpike } from "./document/DocumentSpike";
import { SlidesSpike } from "./slides/SlidesSpike";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <main style={{ fontFamily: "system-ui, sans-serif", padding: 16, maxWidth: 1100 }}>
      <h1>Nova technology compatibility spike (TPI-NOVA-002)</h1>
      <p>Isolated prototype. Not deployed. Not StudioFlow.</p>
      <DocumentSpike />
      <hr />
      <SlidesSpike />
    </main>
  </StrictMode>,
);
