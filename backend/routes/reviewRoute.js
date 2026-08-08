import express from "express";

import { createReview, deleteReview, getItemReviews, getReviews, updateReview, updateReviewApproval } from "../controllers/reviewController.js";
import { requireAdmin, requireAuth } from "../middleware/authentication.js";

const reviewRouter = express.Router()

reviewRouter.get("/item/:itemId", getItemReviews)
reviewRouter.get("/", requireAuth, requireAdmin, getReviews)
reviewRouter.post("/", requireAuth, createReview)
reviewRouter.patch("/:id/approval", requireAuth, requireAdmin, updateReviewApproval)
reviewRouter.patch("/:id", requireAuth, updateReview)
reviewRouter.delete("/:id", requireAuth, deleteReview)

export default reviewRouter;
