import express from "express";

import { createCategory, deleteCategory, getCategories, getCategory, updateCategory } from "../controllers/categoryController.js";
import { requireAdmin, requireAuth } from "../middleware/authentication.js";

const categoryRouter = express.Router()

categoryRouter.get("/", getCategories)
categoryRouter.get("/:id", getCategory)
categoryRouter.post("/", requireAuth, requireAdmin, createCategory)
categoryRouter.patch("/:id", requireAuth, requireAdmin, updateCategory)
categoryRouter.delete("/:id", requireAuth, requireAdmin, deleteCategory)

export default categoryRouter;
