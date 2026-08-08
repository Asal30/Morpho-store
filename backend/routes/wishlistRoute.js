import express from "express";

import { addWishlistItem, clearWishlist, getWishlist, removeWishlistItem } from "../controllers/wishlistController.js";
import { requireAuth } from "../middleware/authentication.js";

const wishlistRouter = express.Router()

wishlistRouter.use(requireAuth)
wishlistRouter.get("/", getWishlist)
wishlistRouter.post("/:itemId", addWishlistItem)
wishlistRouter.delete("/:itemId", removeWishlistItem)
wishlistRouter.delete("/", clearWishlist)

export default wishlistRouter;
