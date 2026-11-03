// Lightweight diagnostics surface used by Nova acceptance tests and by support
// when a user reports an editor problem. It records runtime errors that reach
// the window; it never captures document content or credentials.

export interface NovaDiagnostics {
  errors: string[];
}

declare global {
  interface Window {
    __novaDiagnostics?: NovaDiagnostics;
  }
}

export function installDiagnostics(): void {
  const state: NovaDiagnostics = { errors: [] };
  window.__novaDiagnostics = state;

  window.addEventListener("error", event => {
    state.errors.push(String(event.message || "Unknown window error"));
  });
  window.addEventListener("unhandledrejection", event => {
    const reason = event.reason;
    state.errors.push(reason instanceof Error ? reason.message : String(reason));
  });
}
