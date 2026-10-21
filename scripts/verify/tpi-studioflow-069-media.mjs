#!/usr/bin/env node
/* TPI-STUDIOFLOW-069: offline contract test for the browser media bridge. */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const bridgePath = "studio/workspace-asset-state-bridge.js";
const bridgeSource = readFileSync(bridgePath, "utf8");
const storage = new Map();
const media = new Map([["media-custom-background", new Blob(["synthetic-image"], { type: "image/png" })]]);
const calls = [];

const localStorage = {
  getItem(key) { return storage.has(key) ? storage.get(key) : null; },
  setItem(key, value) { storage.set(key, String(value)); },
  removeItem(key) { storage.delete(key); }
};

const indexedDB = {
  open() {
    const request = {};
    setTimeout(() => {
      request.result = {
        transaction() {
          return {
            objectStore() {
              return { get(key) { const item = {}; setTimeout(() => { item.result = media.get(key) || null; item.onsuccess?.(); }, 0); return item; } };
            }
          };
        },
        close() {}
        };
      request.onsuccess?.();
    }, 0);
    return request;
  }
};

const workspaceResponse = (configuration, version = 2) => new Response(JSON.stringify({
  ok: true,
  workspace: { id: "workspace-1", title: "Synthetic Studio", description: "", version, state: { configuration } }
}), { status: 200, headers: { "content-type": "application/json" } });

const window = {
  indexedDB,
  localStorage,
  crypto,
  fetch: async (input, init = {}) => {
    const url = typeof input === "string" ? input : input.url;
    const method = String(init.method || "GET").toUpperCase();
    if (method === "POST" && url.endsWith("/workspace-1/media")) {
      assert.equal(init.body instanceof FormData, true, "media upload uses multipart form data");
      const file = init.body.get("file");
      assert.equal(file.type, "image/png", "media upload preserves the browser Blob MIME type");
      calls.push({ method, url });
      return new Response(JSON.stringify({ ok: true, asset: {
        id: "asset-1", serverAssetId: "asset-1", serverUrl: "/api/studio/workspaces/workspace-1/media/asset-1", contentType: "image/png", mediaKind: "image"
      } }), { status: 201, headers: { "content-type": "application/json" } });
    }
    if (method === "PATCH") {
      const body = JSON.parse(init.body);
      calls.push({ method, url, body });
      return workspaceResponse(body.state.configuration);
    }
    return workspaceResponse({});
  },
  dispatchEvent() {}
};

const context = {
  window,
  localStorage,
  indexedDB,
  FormData,
  File,
  Blob,
  Response,
  Event,
  CustomEvent,
  crypto,
  setTimeout,
  clearTimeout,
  Promise,
  JSON,
  encodeURIComponent,
  decodeURIComponent
};
vm.runInNewContext(bridgeSource, context, { filename: bridgePath });

const configuration = {
  customBackground: { blobKey: "media-custom-background", fileName: "synthetic.png", mediaType: "image", size: 15, title: "Synthetic background" },
  selectedBackground: "custom-image"
};
const response = await window.fetch("/api/studio/workspaces/workspace-1", {
  method: "PATCH",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ expectedVersion: 1, state: { configuration } })
});
assert.equal(response.ok, true, "workspace save remains successful after media sync");
assert.equal(calls.filter(call => call.method === "POST").length, 1, "one supported custom asset is uploaded");
const patchCall = calls.find(call => call.method === "PATCH");
assert.equal(patchCall.body.state.configuration.customBackground.serverAssetId, "asset-1", "saved configuration receives a stable server asset id");
assert.equal(patchCall.body.state.configuration.customBackground.serverUrl, "/api/studio/workspaces/workspace-1/media/asset-1", "saved configuration receives an authenticated server media URL");

console.log("TPI-069 media bridge contract: 5/5 checks passed");
