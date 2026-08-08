import express from "express";

import { createOrder, getMyOrders, getOrder, getOrders, updateOrderStatus, updatePaymentStatus } from "../controllers/orderController.js";
import { requireAdmin, requireAuth } from "../middleware/authentication.js";

const orderRouter = express.Router()

orderRouter.use(requireAuth)
orderRouter.post("/", createOrder)
orderRouter.get("/my", getMyOrders)
orderRouter.get("/", requireAdmin, getOrders)
orderRouter.patch("/:id/status", requireAdmin, updateOrderStatus)
orderRouter.patch("/:id/payment-status", requireAdmin, updatePaymentStatus)
orderRouter.get("/:id", getOrder)

export default orderRouter;
