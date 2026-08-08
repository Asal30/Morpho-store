import express from "express";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import { env } from "../config/env.js";
import { authenticate, issueSession, requireAdmin, requireMutation, revokeSession } from "../middleware/auth.js";
import { HttpError } from "../middleware/errors.js";

export const authRouter = express.Router();
const loginSchema = z.object({ username: z.string().min(1).max(100), password: z.string().min(1).max(500) });
const limiter = rateLimit({ windowMs: 15 * 60_000, limit: 10, standardHeaders: true, legacyHeaders: false });
authRouter.post("/login", limiter, async (req, res) => { const body = loginSchema.parse(req.body); if (!(await authenticate(body.username, body.password))) throw new HttpError(401, "Invalid credentials"); const expiresAt = await issueSession(res); res.json({ username: env.ADMIN_USERNAME, expiresAt }); });
authRouter.get("/session", requireAdmin, (req, res) => res.json({ username: env.ADMIN_USERNAME, expiresAt: req.adminSession.expiresAt }));
authRouter.post("/logout", requireAdmin, requireMutation, async (req, res) => { await revokeSession(req, res); res.status(204).end(); });
