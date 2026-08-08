import express from "express";
import { Product } from "../models/product.js";
import { catalogOptions, serializeProduct } from "../services/catalog.js";
import { productQuery } from "../schemas/catalog.js";
import { HttpError } from "../middleware/errors.js";

export const catalogRouter = express.Router();
catalogRouter.get("/products", async (req, res) => {
  const query = productQuery.parse(req.query); const filter = { archivedAt: null };
  if (query.garment) filter.garmentSlug = query.garment; if (query.theme) filter.themeSlug = query.theme;
  if (query.color) filter.colorSlug = query.color; if (query.size) filter["variants.sizeSlug"] = query.size;
  const sort = query.sort === "name-asc" ? { name: 1 } : query.sort === "name-desc" ? { name: -1 } : { displayOrder: 1, createdAt: 1 };
  const [total, products] = await Promise.all([Product.countDocuments(filter), Product.find(filter).sort(sort).skip((query.page - 1) * query.pageSize).limit(query.pageSize)]);
  res.json({ items: await Promise.all(products.map(serializeProduct)), page: query.page, pageSize: query.pageSize, total, pages: total ? Math.ceil(total / query.pageSize) : 0 });
});
catalogRouter.get("/products/:slug", async (req, res) => { const product = await Product.findOne({ slug: req.params.slug, archivedAt: null }); if (!product) throw new HttpError(404, "Product not found"); res.json(await serializeProduct(product)); });
catalogRouter.get("/catalog/options", async (_req, res) => res.json(await catalogOptions()));
