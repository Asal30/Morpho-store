import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { env, assertAuthEnvironment } from "../config/env.js";
import { AdminSession } from "../models/admin-session.js";
import { HttpError } from "./errors.js";

export const SESSION_COOKIE = "morpho_admin_session";
export const CSRF_COOKIE = "morpho_admin_csrf";
const digest = (value) => crypto.createHmac("sha256", env.SESSION_SECRET).update(value).digest("hex");
const cookieOptions = { sameSite: "strict", secure: env.NODE_ENV === "production", path: "/" };

export async function authenticate(username, password) {
  assertAuthEnvironment();
  const validName = crypto.timingSafeEqual(
    crypto.createHash("sha256").update(username).digest(),
    crypto.createHash("sha256").update(env.ADMIN_USERNAME).digest(),
  );
  return validName && bcrypt.compare(password, env.ADMIN_PASSWORD_HASH);
}
export async function issueSession(res) {
  const token = crypto.randomBytes(48).toString("base64url"); const csrf = crypto.randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + env.ADMIN_SESSION_HOURS * 3600000);
  await AdminSession.create({ tokenHash: digest(token), csrfHash: digest(csrf), expiresAt });
  const maxAge = env.ADMIN_SESSION_HOURS * 3600000;
  res.cookie(SESSION_COOKIE, token, { ...cookieOptions, httpOnly: true, maxAge });
  res.cookie(CSRF_COOKIE, csrf, { ...cookieOptions, httpOnly: false, maxAge });
  return expiresAt;
}
export async function requireAdmin(req, _res, next) {
  try {
    assertAuthEnvironment(); const token = req.cookies[SESSION_COOKIE];
    if (!token) throw new HttpError(401, "Authentication required");
    const session = await AdminSession.findOne({ tokenHash: digest(token), expiresAt: { $gt: new Date() } });
    if (!session) throw new HttpError(401, "Session expired"); req.adminSession = session; next();
  } catch (error) { next(error); }
}
export function requireMutation(req, _res, next) {
  try {
    if (req.get("origin") && req.get("origin") !== env.FRONTEND_ORIGIN) throw new HttpError(403, "Invalid request origin");
    const csrf = req.cookies[CSRF_COOKIE]; const header = req.get("x-csrf-token");
    if (!csrf || !header) throw new HttpError(403, "CSRF validation failed");
    const csrfHash = digest(csrf); const headerHash = digest(header);
    if (!crypto.timingSafeEqual(Buffer.from(csrfHash), Buffer.from(headerHash)) || !crypto.timingSafeEqual(Buffer.from(csrfHash), Buffer.from(req.adminSession.csrfHash))) throw new HttpError(403, "CSRF validation failed");
    next();
  } catch (error) { next(error); }
}
export async function revokeSession(req, res) {
  await AdminSession.deleteOne({ _id: req.adminSession._id });
  res.clearCookie(SESSION_COOKIE, cookieOptions); res.clearCookie(CSRF_COOKIE, cookieOptions);
}
