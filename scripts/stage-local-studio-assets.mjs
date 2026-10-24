import { existsSync, mkdirSync, readFileSync, renameSync, unlinkSync, writeFileSync } from "node:fs";
import { basename, dirname, join, relative } from "node:path";
import { contentVersion, studioAssetUrls, versionStudioAssetReferences } from "./studioflow-asset-version.mjs";

// These files are loaded directly by studio/index.html and can change without
// changing the generated bundle filenames. Keep them in the same atomic local
// staging path as the hashed bundle so the Worker never serves an older bridge
// alongside the current StudioFlow shell.
export const STUDIO_RUNTIME_FILES = [
  "workspace-asset-state-bridge.js",
  "production-lock-bridge.js",
  "workspace-bridge.js",
  "video-playback-reset-bridge.js",
  "video-clip-management-bridge.js",
  "audio-soundboard-bridge.js",
  "backup-bridge.js",
  "backup-core.mjs",
  "navigation-bridge.js",
  "studioflow-012-overrides.css",
  // TPI-STUDIOFLOW-032: approved pad artwork served to the soundboard cards.
  "Waveform.png",
  "Microphone.png",
];

export function stageStudioAssets({ repoRoot = process.cwd(), stage = join(repoRoot, ".local-dev/assets") } = {}) {
  const sourceHtmlPath = join(repoRoot, "studio/index.html");
  const html = readFileSync(sourceHtmlPath, "utf8");
  const assetUrls = studioAssetUrls(html);
  const files = assetUrls.map(url => [
    join(repoRoot, url.replace(/^\//, "")),
    join(stage, url.replace(/^\//, "")),
  ]);
  const requiredKinds = [".js", ".css"];
  for (const extension of requiredKinds) {
    if (!assetUrls.some(url => url.endsWith(extension))) {
      throw new Error(`StudioFlow entry point does not reference a ${extension} asset`);
    }
  }
  const contentsByUrl = new Map();
  for (const [source, target] of files) {
    if (!existsSync(source)) {
      throw new Error(`StudioFlow entry point references a missing asset: ${relative(repoRoot, source)}`);
    }
    const content = readFileSync(source);
    atomicWrite(target, content);
    contentsByUrl.set(`/studio/assets/${basename(target)}`, content);
  }

  for (const name of STUDIO_RUNTIME_FILES) {
    atomicWrite(join(stage, "studio", name), readFileSync(join(repoRoot, "studio", name)));
  }

  const targetHtmlPath = join(stage, "studio/index.html");
  atomicWrite(targetHtmlPath, versionStudioAssetReferences(html, contentsByUrl));
  const primaryJavaScript = files.find(([source]) => source.endsWith(".js"))?.[0];
  const primaryCss = files.find(([source]) => source.endsWith(".css"))?.[0];
  return {
    javascriptVersion: contentVersion(readFileSync(primaryJavaScript)),
    cssVersion: contentVersion(readFileSync(primaryCss)),
    assetUrls,
  };
}

function atomicWrite(target, content) {
  mkdirSync(dirname(target), { recursive: true });
  const temporary = `${target}.tpi-studio-tmp-${process.pid}-${Date.now()}`;
  try {
    writeFileSync(temporary, content);
    renameSync(temporary, target);
  } catch (error) {
    try { unlinkSync(temporary); } catch {}
    throw error;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  console.log(JSON.stringify({ stage: join(process.cwd(), ".local-dev/assets"), ...stageStudioAssets() }));
}
