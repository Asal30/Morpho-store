import jwt from "jsonwebtoken";

import User from "../models/userModel.js";
import { sendError } from "../utilities/http.js";

export async function requireAuth(req, res, next) {
    const authorization = req.header("Authorization")

    if (!authorization?.startsWith("Bearer ")) {
        return sendError(res, 401, "Authentication required")
    }

    const token = authorization.slice(7).trim()

    try {
        const decoded = jwt.verify(token, process.env.JWT_KEY)
        const user = await User.findById(decoded.id).select("-password")

        if (!user) return sendError(res, 401, "Authentication required")
        if (user.isDisabled) return sendError(res, 403, "Account is disabled")

        req.user = user
        next()
    } catch {
        return sendError(res, 401, "Invalid or expired token")
    }
}

export function requireAdmin(req, res, next) {
    if (req.user?.type !== "admin") {
        return sendError(res, 403, "Administrator access required")
    }

    next()
}
