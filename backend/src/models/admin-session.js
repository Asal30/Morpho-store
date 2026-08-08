import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
  { tokenHash: { type: String, unique: true, required: true, index: true }, csrfHash: { type: String, required: true }, expiresAt: { type: Date, required: true, index: { expires: 0 } } },
  { timestamps: true },
);
export const AdminSession = mongoose.model("AdminSession", sessionSchema);
