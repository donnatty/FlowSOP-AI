---
name: Switching from pnpm to npm
description: Converting a Replit pnpm workspace root into a standalone npm app.
---

When converting a Replit pnpm workspace root to npm, remove the old root `node_modules` tree and pnpm-only `.npmrc` options before installing. npm 11 can fail while resolving stale `.pnpm` links with an Arborist `isDescendantOf` error.

**Why:** Replit's pnpm installation leaves a linked store at the project root, and npm may treat those links as dependencies even after the workspace manifest is removed. Replit's npm proxy can also write private `package-firewall.replit.internal` URLs into `package-lock.json`; a lockfile containing those URLs will not be portable to Netlify.

**How to apply:** For an explicitly requested npm migration, clear the old root install state before installing. Before committing a lockfile for an external host, verify its `resolved` URLs use a public registry; regenerate with the public registry or omit the generated lockfile if it cannot be made portable.
