import express from "express";

import { cancelMyCustomizationRequest, createCustomizationRequest, getCustomizationRequest, getCustomizationRequests, getMyCustomizationRequests, quoteCustomization, updateCustomizationRequest, updateCustomizationStatus, updateMyCustomizationRequest } from "../controllers/customizationRequestController.js";
import { requireAdmin, requireAuth } from "../middleware/authentication.js";
import { handleArtworkUpload } from "../middleware/artworkUpload.js";

const customizationRequestRouter = express.Router()

customizationRequestRouter.post("/quote", quoteCustomization)
customizationRequestRouter.use(requireAuth)
customizationRequestRouter.post("/", handleArtworkUpload, createCustomizationRequest)
customizationRequestRouter.get("/my", getMyCustomizationRequests)
customizationRequestRouter.get("/", requireAdmin, getCustomizationRequests)
customizationRequestRouter.patch("/:id/status", requireAdmin, updateCustomizationStatus)
customizationRequestRouter.patch("/:id/admin", requireAdmin, updateCustomizationRequest)
customizationRequestRouter.patch("/:id", handleArtworkUpload, updateMyCustomizationRequest)
customizationRequestRouter.delete("/:id", cancelMyCustomizationRequest)
customizationRequestRouter.get("/:id", getCustomizationRequest)

export default customizationRequestRouter;
