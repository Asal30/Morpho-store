import crypto from "node:crypto";
import path from "node:path";
import sharp from "sharp";
import { env } from "../config/env.js";
import { HttpError } from "../middleware/errors.js";
import { MediaAsset } from "../models/media.js";
import { Product } from "../models/product.js";
import { getMediaStorage } from "./storage.js";

const formats = { "image/jpeg": ["jpeg", ".jpg"], "image/png": ["png", ".png"], "image/webp": ["webp", ".webp"] };
export function serializeMedia(asset) { return { id: asset.assetId, storageKey: asset.storageKey, publicUrl: asset.publicUrl || `${env.PUBLIC_API_URL}/media/${asset.storageKey}`, originalFilename: asset.originalFilename, mimeType: asset.mimeType, sizeBytes: asset.sizeBytes, width: asset.width, height: asset.height, createdAt: asset.createdAt }; }
export async function uploadMedia(file) {
  if (!formats[file.mimetype]) throw new HttpError(415, "Unsupported image type");
  let metadata; try { metadata = await sharp(file.buffer).metadata(); } catch { throw new HttpError(422, "Invalid image data"); }
  if (metadata.format !== formats[file.mimetype][0]) throw new HttpError(422, "Image MIME type mismatch");
  const storageKey = `products/${crypto.randomBytes(24).toString("hex")}${formats[file.mimetype][1]}`;
  await getMediaStorage().save(storageKey, file.buffer);
  const asset = await MediaAsset.create({ storageKey, publicUrl: `${env.PUBLIC_API_URL.replace(/\/$/, "")}/media/${storageKey}`, originalFilename: path.basename(file.originalname).slice(0, 255), mimeType: file.mimetype, sizeBytes: file.size, width: metadata.width, height: metadata.height });
  return serializeMedia(asset);
}
export async function removeMedia(assetId) {
  const asset = await MediaAsset.findOne({ assetId }); if (!asset) throw new HttpError(404, "Media asset not found");
  if (await Product.exists({ "images.mediaAssetId": assetId })) throw new HttpError(409, "Media asset is in use");
  await getMediaStorage().delete(asset.storageKey); await asset.deleteOne();
}
