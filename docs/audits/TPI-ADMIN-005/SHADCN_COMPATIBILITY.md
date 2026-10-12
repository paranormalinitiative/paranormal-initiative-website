# shadcn/ui compatibility

Status: PASS for isolated React/Vite preview

The preview uses a `components.json` configuration and source-owned UI
components under `admin-center-app/src/components/ui/`. The initial slice
uses Button, Card, Badge, Input, Separator, and Table primitives with the
`cn` utility, `class-variance-authority`, `lucide-react`, and Tailwind v4.
Components are source files rather than an opaque runtime dependency, so TPI
can review and customize them without changing the legacy site.

Pinned implementation versions include Tailwind `4.3.3`, `@tailwindcss/vite`
`4.3.3`, `tw-animate-css` `1.3.0`, and shadcn CLI `4.21.4`. Vite build and
browser shell checks passed. Production dependencies report zero high-severity
issues under `npm audit --omit=dev --audit-level=high`; npm reported seven
high findings in development tooling, which remain a release follow-up rather
than a runtime dependency claim.

References: [shadcn Vite installation](https://ui.shadcn.com/docs/installation/vite),
[shadcn manual installation](https://ui.shadcn.com/docs/installation/manual),
[shadcn components.json](https://ui.shadcn.com/docs/components-json).
