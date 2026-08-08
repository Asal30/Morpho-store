import { ZodError } from "zod";

export class HttpError extends Error { constructor(status, message) { super(message); this.status = status; } }
export function notFound(_req, _res, next) { next(new HttpError(404, "Not found")); }
export function errorHandler(error, _req, res, _next) {
  if (error instanceof ZodError) return res.status(422).json({ detail: error.issues });
  if (error?.code === 11000) return res.status(422).json({ detail: "Product slug already exists" });
  const status = error.status ?? 500;
  return res.status(status).json({ detail: status === 500 ? "Internal server error" : error.message });
}
