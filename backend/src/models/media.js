import crypto from "node:crypto";
import mongoose from "mongoose";

const mediaSchema = new mongoose.Schema(
  { assetId: { type: String, unique: true, default: () => crypto.randomUUID() }, storageKey: { type: String, unique: true, required: true }, publicUrl: String, originalFilename: { type: String, required: true }, mimeType: { type: String, required: true }, sizeBytes: { type: Number, min: 1, required: true }, width: { type: Number, min: 1, required: true }, height: { type: Number, min: 1, required: true } },
  { timestamps: true },
);
export const MediaAsset = mongoose.model("MediaAsset", mediaSchema);
