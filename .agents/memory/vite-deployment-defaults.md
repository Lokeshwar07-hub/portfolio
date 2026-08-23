---
name: Vite deployment defaults
description: Vite configs in this workspace must not require Replit-only environment variables during production builds.
---

Vite artifact configs should default to a normal root base path and a local development port, only enforcing an explicit port when a workflow provides one. Replit-only plugins should load only during Replit development.

**Why:** The workspace production build can run without Replit workflow variables, and it traverses more than one Vite artifact.

**How to apply:** When adding or updating a Vite config, keep `PORT` and `BASE_PATH` optional for production and scope Replit plugins behind non-production Replit detection.