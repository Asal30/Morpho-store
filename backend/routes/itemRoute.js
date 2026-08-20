import express from "express";

import { addItemImages, archiveItem, createItem, deleteItemImage, getItem, getItemBySlug, getItems, updateImageMetadata, updateItem } from "../controllers/itemController.js";
import { requireAdmin, requireAuth } from "../middleware/authentication.js";
import { handleProductImages } from "../middleware/productImageUpload.js";

const itemRouter = express.Router()

itemRouter.get("/", getItems)
itemRouter.get("/slug/:slug", getItemBySlug)
itemRouter.get("/:id", getItem)
itemRouter.post("/", requireAuth, requireAdmin, handleProductImages, createItem)
itemRouter.post("/:id/images", requireAuth, requireAdmin, handleProductImages, addItemImages)
itemRouter.patch("/:id/images", requireAuth, requireAdmin, updateImageMetadata)
itemRouter.delete("/:id/images/:imageId", requireAuth, requireAdmin, deleteItemImage)
itemRouter.patch("/:id", requireAuth, requireAdmin, updateItem)
itemRouter.delete("/:id", requireAuth, requireAdmin, archiveItem)

export default itemRouter;
