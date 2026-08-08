import express from "express";

import { createGalleryItem, deleteGalleryItem, getGallery, getGalleryItem, updateGalleryItem } from "../controllers/galleryController.js";
import { requireAdmin, requireAuth } from "../middleware/authentication.js";

const galleryRouter = express.Router()

galleryRouter.get("/", getGallery)
galleryRouter.get("/:id", getGalleryItem)
galleryRouter.post("/", requireAuth, requireAdmin, createGalleryItem)
galleryRouter.patch("/:id", requireAuth, requireAdmin, updateGalleryItem)
galleryRouter.delete("/:id", requireAuth, requireAdmin, deleteGalleryItem)

export default galleryRouter;
