# Authentication

Mutating bridge calls use the existing same-origin session cookie and `requireContributor`; no bearer token or stream key is placed in browser code. The StudioFlow app records the authenticated role from `/api/auth/me` and exposes bridge controls only to the existing contributor-capable roles. The Worker and API continue to enforce access server-side.

New bridge mutations reject a supplied `Origin` that does not match the request origin. Requests without an Origin header remain compatible with existing local CLI/E2E harnesses. Unauthorized and anonymous requests remain denied by the existing API gate.
