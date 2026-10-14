# TPI-DEV-012 — Role Permissions and Creator Access

## Scope

This directive continues the TPI-DEV-011 Administration Center work in the development environment. It separates three access responsibilities:

- Administration Center: existing `owner` and `admin` server authorization.
- Content tools: existing `owner`, `admin`, and `contributor` authorization plus resource ownership checks.
- Creator Studio / StudioFlow: existing `owner` and `admin` access, plus an explicit active `creator_studio_entitlements` record for approved creators.

Production, production accounts, production sessions, production D1/R2, and production deployment targets are out of scope.

## Safety requirements

The implementation must reuse the existing session and role architecture. No browser-supplied role, hidden field, local-storage flag, query parameter, or navigation state is authorization. Every protected page and API must make its own server-side decision. New accounts receive no administrative or Creator Studio entitlement automatically. Founding 50 award and membership mutation workflows remain unchanged and inactive.

## Required verification

The implementation report must identify completed source checks, development live checks, the authenticated role sessions that were actually available, deployment identity, production-preservation evidence, and any owner-approval gaps. If approved creator or owner sessions are unavailable, completion must be reported as partial.
