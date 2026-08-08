import express from "express";

import { cancelMyCustomizationRequest, createCustomizationRequest, getCustomizationRequest, getCustomizationRequests, getMyCustomizationRequests, updateCustomizationRequest, updateCustomizationStatus, updateMyCustomizationRequest } from "../controllers/customizationRequestController.js";
import { requireAdmin, requireAuth } from "../middleware/authentication.js";

const customizationRequestRouter = express.Router()

customizationRequestRouter.use(requireAuth)
customizationRequestRouter.post("/", createCustomizationRequest)
customizationRequestRouter.get("/my", getMyCustomizationRequests)
customizationRequestRouter.get("/", requireAdmin, getCustomizationRequests)
customizationRequestRouter.patch("/:id/status", requireAdmin, updateCustomizationStatus)
customizationRequestRouter.patch("/:id/admin", requireAdmin, updateCustomizationRequest)
customizationRequestRouter.patch("/:id", updateMyCustomizationRequest)
customizationRequestRouter.delete("/:id", cancelMyCustomizationRequest)
customizationRequestRouter.get("/:id", getCustomizationRequest)

export default customizationRequestRouter;
