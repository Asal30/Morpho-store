import express from "express";

import { getMe, getUser, getUsers, login, register, updateMe, updateUser, updateUserStatus } from "../controllers/userController.js";
import { requireAdmin, requireAuth } from "../middleware/authentication.js";

const userRouter = express.Router()

userRouter.post("/register", register)
userRouter.post("/login", login)
userRouter.get("/me", requireAuth, getMe)
userRouter.patch("/me", requireAuth, updateMe)
userRouter.get("/", requireAuth, requireAdmin, getUsers)
userRouter.get("/:id", requireAuth, requireAdmin, getUser)
userRouter.patch("/:id/status", requireAuth, requireAdmin, updateUserStatus)
userRouter.patch("/:id", requireAuth, requireAdmin, updateUser)

export default userRouter;
