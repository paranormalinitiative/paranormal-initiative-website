import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { studioAssetUrls } from "../studioflow-asset-version.mjs";

/**
 * Read the generated StudioFlow shell as the authoritative asset manifest.
 * This keeps source-only verification independent of build-generated hashes.
 */
export function readStudioAssetManifest(studioRoot = "studio") {
  const root = resolve(studioRoot);
  const shellPath = resolve(root, "index.html");
  const shell = readFileSync(shellPath, "utf8");
  const assets = studioAssetUrls(shell).map((url) => ({
    url,
    path: resolve(root, url.replace(/^\/studio\//, "")),
    kind: url.endsWith(".js") ? "javascript" : "stylesheet",
  }));

  if (!assets.some((asset) => asset.kind === "javascript")) {
    throw new Error(`StudioFlow shell has no JavaScript asset reference: ${shellPath}`);
  }
  if (!assets.some((asset) => asset.kind === "stylesheet")) {
    throw new Error(`StudioFlow shell has no CSS asset reference: ${shellPath}`);
  }

  const missing = assets.filter((asset) => !existsSync(asset.path));
  if (missing.length) {
    throw new Error(`StudioFlow shell references missing assets: ${missing.map((asset) => asset.path).join(", ")}`);
  }

  return {
    shellPath,
    assets,
    javascript: assets.find((asset) => asset.kind === "javascript"),
    stylesheet: assets.find((asset) => asset.kind === "stylesheet"),
  };
}
