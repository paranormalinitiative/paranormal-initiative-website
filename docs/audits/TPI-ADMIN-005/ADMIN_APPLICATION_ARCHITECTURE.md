# Administration application architecture

## Source and output

- Source: `admin-center-app/`
- Compiled preview: `admin-center-preview/`
- Preview URL: `/admin-center-preview/`
- Build output is rooted under the existing Cloudflare asset directory.
- Source and dependency folders are excluded from Cloudflare assets through
  `.assetsignore`.

## Runtime layers

1. Worker route gate resolves the existing `tpi_session` cookie and permits
   only `owner` or `admin` to load the preview document/assets.
2. React/Refine provides application composition and data-query state.
3. The custom data provider maps the member list to the existing TPI API.
4. Dashboard, analytics, member detail, and audit views call existing
   protected `/api/admin/*` endpoints.
5. D1 remains the authoritative source through the current Worker handlers.

No route replaces `/admin-panel`. Owner acceptance is required before any
replacement decision.
