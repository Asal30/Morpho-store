import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import { z } from "zod";

const currentFile = fileURLToPath(import.meta.url);
const backendDir = path.resolve(path.dirname(currentFile), "../..");
const repoRoot = path.resolve(backendDir, "..");

dotenv.config({ path: [path.join(backendDir, ".env"), path.join(repoRoot, ".env")] });

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().min(1).max(65535).default(8000),
  MONGODB_URI: z.string().min(1).default("mongodb://localhost:27017/morpho_store"),
  FRONTEND_ORIGIN: z.url().default("http://localhost:3000"),
  PUBLIC_API_URL: z.url().default("http://localhost:8000"),
  ADMIN_USERNAME: z.string().min(1).optional(),
  ADMIN_PASSWORD_HASH: z.string().min(20).optional(),
  SESSION_SECRET: z.string().min(32).optional(),
  ADMIN_SESSION_HOURS: z.coerce.number().int().min(1).max(168).default(12),
  MEDIA_STORAGE_BACKEND: z.literal("local").default("local"),
  MEDIA_STORAGE_ROOT: z.string().min(1).default("storage/uploads"),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) throw new Error(`Invalid environment: ${z.prettifyError(parsed.error)}`);
export const env = parsed.data;

export function assertAuthEnvironment() {
  const missing = ["ADMIN_USERNAME", "ADMIN_PASSWORD_HASH", "SESSION_SECRET"].filter(
    (name) => !env[name],
  );
  if (missing.length) throw new Error(`Missing required admin environment: ${missing.join(", ")}`);
}
