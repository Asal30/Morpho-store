import path from "node:path";
import cors from "cors";
import cookieParser from "cookie-parser";
import express from "express";
import helmet from "helmet";
import { env } from "./config/env.js";
import { adminRouter } from "./routes/admin.js";
import { authRouter } from "./routes/auth.js";
import { catalogRouter } from "./routes/catalog.js";
import { errorHandler, notFound } from "./middleware/errors.js";

export const app = express();
app.disable("x-powered-by"); app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors({ origin: env.FRONTEND_ORIGIN, credentials: true })); app.use(express.json({ limit: "1mb" })); app.use(cookieParser());
app.use("/media", express.static(path.resolve(env.MEDIA_STORAGE_ROOT)));
app.get("/health", (_req, res) => res.json({ status: "ok", service: "morpho-api" }));
app.use("/api/admin/auth", authRouter); app.use("/api/admin", adminRouter); app.use("/api", catalogRouter);
app.use(notFound); app.use(errorHandler);
