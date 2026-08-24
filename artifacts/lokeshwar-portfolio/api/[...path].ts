import type { Request, Response } from "express";
import app from "../../../artifacts/api-server/src/app";

/**
 * Vercel invokes catch-all functions with either the full `/api/...` path or
 * the path relative to the function. Normalize both forms for the existing
 * Express router, which is mounted at `/api`.
 */
export default function handler(req: Request, res: Response) {
  if (req.url && !req.url.startsWith("/api")) {
    req.url = `/api${req.url.startsWith("/") ? req.url : `/${req.url}`}`;
  }

  return app(req, res);
}