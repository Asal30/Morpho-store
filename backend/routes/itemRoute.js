import express from "express";

import { archiveItem, createItem, getItem, getItemBySlug, getItems, updateItem } from "../controllers/itemController.js";
import { requireAdmin, requireAuth } from "../middleware/authentication.js";

const itemRouter = express.Router()

itemRouter.get("/", getItems)
itemRouter.get("/slug/:slug", getItemBySlug)
itemRouter.get("/:id", getItem)
itemRouter.post("/", requireAuth, requireAdmin, createItem)
itemRouter.patch("/:id", requireAuth, requireAdmin, updateItem)
itemRouter.delete("/:id", requireAuth, requireAdmin, archiveItem)

export default itemRouter;
