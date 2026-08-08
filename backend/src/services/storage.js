import path from "node:path";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import { env } from "../config/env.js";

class LocalMediaStorage {
  constructor(root) { this.root = path.resolve(root); }
  target(storageKey) {
    const target = path.resolve(this.root, storageKey);
    if (!target.startsWith(`${this.root}${path.sep}`)) throw new Error("Unsafe media storage path");
    return target;
  }
  async save(storageKey, content) { const target = this.target(storageKey); await mkdir(path.dirname(target), { recursive: true }); await writeFile(target, content); }
  async delete(storageKey) { await unlink(this.target(storageKey)).catch((error) => { if (error.code !== "ENOENT") throw error; }); }
}

export function getMediaStorage() {
  if (env.MEDIA_STORAGE_BACKEND === "local") return new LocalMediaStorage(env.MEDIA_STORAGE_ROOT);
  throw new Error(`Unsupported media storage backend: ${env.MEDIA_STORAGE_BACKEND}`);
}
