# Framework integration

ADMIN-006 extends the existing ADMIN-005 React/Vite application in
`admin-center-app/`. Refine remains the data-provider abstraction and shadcn-
compatible primitives remain the visual language. No duplicate application,
authentication system, API, or framework installation was added.

The preview builds to `admin-center-preview/` with base
`/admin-center-preview/`; `worker.js` gates the route server-side.
