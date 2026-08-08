import express from "express";

import { addCartItem, addCustomizationToCart, clearCart, getCart, removeCartItem, removeCustomizationFromCart, updateCartItem } from "../controllers/cartController.js";
import { requireAuth } from "../middleware/authentication.js";

const cartRouter = express.Router()

cartRouter.use(requireAuth)
cartRouter.get("/", getCart)
cartRouter.post("/items", addCartItem)
cartRouter.post("/customizations/:customizationId", addCustomizationToCart)
cartRouter.patch("/items/:itemId", updateCartItem)
cartRouter.delete("/items/:itemId", removeCartItem)
cartRouter.delete("/customizations/:customizationId", removeCustomizationFromCart)
cartRouter.delete("/", clearCart)

export default cartRouter;
