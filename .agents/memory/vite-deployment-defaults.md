---
name: Vite deployment defaults
description: Vite configs in this workspace must not require Replit-only environment variables during production builds.
---

Vite artifact configs should default to a normal root base path and a local development port, only enforcing an explicit port when a workflow provides one. Replit-only plugins should load only during Replit development.

**Why:** The workspace production build can run without Replit workflow variables, and it traverses more than one Vite artifact.

**How to apply:** When adding or updating a Vite config, keep `PORT` and `BASE_PATH` optional for production and scope Replit plugins behind non-production Replit detection.

For a static Vite portfolio that uses relative `/api/...` requests, the Vercel project must also expose an API function or rewrite those requests to a separately deployed backend. Same-origin serverless functions require no frontend API URL or CORS environment variable.

**Why:** A static Vercel deployment does not automatically serve the separate Express workspace service, so relative API requests otherwise return the frontend host's 404.

**How to apply:** Prefer a Vercel catch-all function that reuses the existing Express app when the project root includes the API workspace; otherwise configure a production API base URL and deploy the API separately.