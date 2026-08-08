import express from "express";

import { addCartItem, clearCart, getCart, removeCartItem, updateCartItem } from "../controllers/cartController.js";
import { requireAuth } from "../middleware/authentication.js";

const cartRouter = express.Router()

cartRouter.use(requireAuth)
cartRouter.get("/", getCart)
cartRouter.post("/items", addCartItem)
cartRouter.patch("/items/:itemId", updateCartItem)
cartRouter.delete("/items/:itemId", removeCartItem)
cartRouter.delete("/", clearCart)

export default cartRouter;
