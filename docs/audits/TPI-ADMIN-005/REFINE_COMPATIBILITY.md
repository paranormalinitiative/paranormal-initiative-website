# Refine compatibility

Status: PASS for isolated React/Vite preview

Pinned implementation versions:

- `@refinedev/core` `5.0.12`
- `@tanstack/react-query` `5.81.5`
- React `19.3.0`
- Vite `8.3.4`

Refine's official quickstart states that it can run wherever React runs,
including Vite, and the core package accepts a custom data provider. The
preview uses the actual `<Refine>` component, a `members` resource, and
`useList` to query the existing TPI member endpoint. The adapter translates
Refine pagination/filter parameters into the current `/api/admin/members`
contract and returns Refine's `{ data, total }` shape.

The existing TPI API authorization remains authoritative. Refine's client
data provider is not treated as a security boundary; the Worker/API
`requireAdmin` checks remain required for every request.

Evidence: `npm run build` passed in `admin-center-app`; the preview source
contains the Refine runtime and data hook; the static preview regression
script passed all six checks.

References: [Refine Quickstart](https://refine.dev/core/docs/getting-started/quickstart/),
[Refine Data Provider](https://refine.dev/core/docs/data/data-provider/),
[Refine Access Control Provider](https://refine.dev/core/docs/authorization/access-control-provider/).
