import express from "express";
import multer from "multer";
import { requireAdmin, requireMutation } from "../middleware/auth.js";
import { HttpError } from "../middleware/errors.js";
import { Product } from "../models/product.js";
import { MediaAsset } from "../models/media.js";
import { productInput } from "../schemas/catalog.js";
import { createProduct, serializeProduct, updateProduct } from "../services/catalog.js";
import { removeMedia, serializeMedia, uploadMedia } from "../services/media.js";

export const adminRouter = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });
adminRouter.use(requireAdmin);
adminRouter.get("/dashboard", async (_req, res) => {
  const active = { archivedAt: null };
  const [totalProducts, availableProducts, unavailableProducts, archivedProducts, oversizedProducts, raglanProducts, customizedProducts, recent] = await Promise.all([
    Product.countDocuments(active), Product.countDocuments({ ...active, availability: "available" }), Product.countDocuments({ ...active, availability: "unavailable" }), Product.countDocuments({ archivedAt: { $ne: null } }), Product.countDocuments({ ...active, category: "oversized" }), Product.countDocuments({ ...active, category: "raglan" }), Product.countDocuments({ ...active, category: "customized" }), Product.find(active).sort({ createdAt: -1 }).limit(5),
  ]);
  res.json({ totalProducts, availableProducts, unavailableProducts, archivedProducts, oversizedProducts, raglanProducts, customizedProducts, recentProducts: await Promise.all(recent.map(serializeProduct)) });
});
adminRouter.get("/products", async (req, res) => {
  const filter = req.query.includeArchived === "true" ? {} : { archivedAt: null };
  if (req.query.search) filter.$or = ["name", "slug"].map((key) => ({ [key]: { $regex: String(req.query.search).trim(), $options: "i" } }));
  if (req.query.garment) { if (!["oversized", "raglan"].includes(req.query.garment)) throw new HttpError(422, "Invalid garment"); filter.garmentSlug = req.query.garment; }
  const products = await Product.find(filter).sort({ createdAt: -1 }); res.json({ items: await Promise.all(products.map(serializeProduct)), total: products.length });
});
adminRouter.get("/products/:id", async (req, res) => { const product = await Product.findOne({ productId: req.params.id }); if (!product) throw new HttpError(404, "Product not found"); res.json(await serializeProduct(product)); });
adminRouter.post("/products", requireMutation, async (req, res) => res.status(201).json(await createProduct(productInput.parse(req.body))));
adminRouter.patch("/products/:id", requireMutation, async (req, res) => res.json(await updateProduct(req.params.id, productInput.parse(req.body))));
adminRouter.post("/products/:id/archive", requireMutation, async (req, res) => { const product = await Product.findOne({ productId: req.params.id }); if (!product) throw new HttpError(404, "Product not found"); product.archivedAt = new Date(); product.availability = "unavailable"; product.variants.forEach((item) => { item.availability = "unavailable"; }); await product.save(); res.status(204).end(); });
adminRouter.get("/media", async (req, res) => { const page = Math.max(1, Number(req.query.page) || 1); const pageSize = Math.min(100, Math.max(1, Number(req.query.pageSize) || 48)); const [total, items] = await Promise.all([MediaAsset.countDocuments(), MediaAsset.find().sort({ createdAt: -1 }).skip((page - 1) * pageSize).limit(pageSize)]); res.json({ items: items.map(serializeMedia), total }); });
adminRouter.post("/media", requireMutation, (req, res, next) => upload.single("file")(req, res, (error) => { if (error?.code === "LIMIT_FILE_SIZE") return next(new HttpError(413, "Image exceeds 10 MB")); if (error) return next(error); return next(); }), async (req, res) => { if (!req.file) throw new HttpError(422, "Image file is required"); res.status(201).json(await uploadMedia(req.file)); });
adminRouter.delete("/media/:id", requireMutation, async (req, res) => { await removeMedia(req.params.id); res.status(204).end(); });
