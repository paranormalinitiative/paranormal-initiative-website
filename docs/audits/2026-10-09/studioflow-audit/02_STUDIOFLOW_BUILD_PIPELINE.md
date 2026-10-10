# StudioFlow Build Pipeline

## Tooling

The canonical workspace uses npm with a checked-in `package-lock.json`. Runtime/build dependencies include React 18, React DOM, Vite 5, the Vite React plugin, TypeScript, and `lucide-react`. No additional release dependency was added by this directive.

## Existing commands

From `/Users/toddknipple/Documents/StudioFlow/web`:

- `npm run build` — runs `tsc && vite build` and writes the default Vite output to `dist/`.
- `npm run check:room` — Node syntax check for `server/room-server.mjs`.
- `npm run check:rtmp` — Node syntax check for `server/rtmp-bridge.mjs`.
- `npm run dev` / `npm run dev:lan` — Vite development server.
- `npm run dev:room` — local room server.
- `npm run dev:rtmp` — local FFmpeg/RTMP bridge.

## Deployment base and assets

`vite.config.ts` sets the production base URL to `/studio/`. The production bundle therefore references `/studio/assets/...`, which is compatible with the TPI `studio/` directory and Worker route. The isolated build produced one HTML entry, one JavaScript bundle, one CSS bundle, and ten bundled image assets.

The current entry references Google Identity Services and Google API scripts. The application also uses browser media APIs, IndexedDB/localStorage, same-origin `/api/` paths for production room relay behavior, and localhost development services in the local-development code paths.

## Safe build behavior

Running Vite with only an alternate `--outDir` was not safe: Vite attempted to write a temporary file beside the real `vite.config.ts` and failed with `EPERM`. No source file was changed by that failed attempt.

The safe procedure is to copy the source/configuration files to a temporary directory, reference the existing `node_modules` read-only, and run Vite from that temporary source directory. The resulting output is also written to a temporary directory. This keeps both the canonical source and existing `dist/` untouched.

## Environment and external services

The build itself does not require a production secret in the inspected Vite configuration. Runtime behavior can require browser permissions, the TPI same-origin API, Cloudflare/D1 room endpoints, local room/RTMP services in development, and external Google scripts. Build success does not validate those runtime services.

## Pipeline conclusion

The expected build output is `StudioFlow/web/dist`, and the bundle is suitable for the `/studio/` base path. A future promotion must use an isolated build, validate the candidate, obtain owner approval, and then copy only approved generated output into TPI `studio/`.

