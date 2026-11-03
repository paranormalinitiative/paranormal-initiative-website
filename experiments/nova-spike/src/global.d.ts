import type { JSONContent } from "@tiptap/core";
import type { Presentation } from "./slides/model";

declare global {
  interface Window {
    // Spike-only read hooks for cross-browser automation.
    __novaErrors: string[];
    __novaSpike?: {
      docJSON?: () => JSONContent;
      presentation?: () => Presentation;
      currentSlide?: () => number;
      selection?: () => string | null;
    };
  }
}

export {};
