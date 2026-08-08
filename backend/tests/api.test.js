import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import bcrypt from "bcryptjs";
import { MongoMemoryServer } from "mongodb-memory-server";
import sharp from "sharp";
import request from "supertest";
import { afterAll, beforeAll, beforeEach, describe, expect, test } from "vitest";

let mongo; let app; let mongoose; let seedReferenceData; let tempRoot;
const credentials = { username: "test-admin", password: "correct-password" };

beforeAll(async () => {
  mongo = await MongoMemoryServer.create(); tempRoot = await mkdtemp(path.join(tmpdir(), "morpho-node-test-"));
  Object.assign(process.env, { NODE_ENV: "test", MONGODB_URI: mongo.getUri(), FRONTEND_ORIGIN: "http://localhost:3000", PUBLIC_API_URL: "http://testserver", ADMIN_USERNAME: credentials.username, ADMIN_PASSWORD_HASH: await bcrypt.hash(credentials.password, 4), SESSION_SECRET: "test-only-session-secret-at-least-32-characters", MEDIA_STORAGE_ROOT: tempRoot });
  ({ default: mongoose } = await import("mongoose")); ({ app } = await import("../src/app.js")); ({ seedReferenceData } = await import("../src/services/seed.js"));
  await mongoose.connect(mongo.getUri());
});
afterAll(async () => { if (mongoose) await mongoose.disconnect(); if (mongo) await mongo.stop(); if (tempRoot) await rm(tempRoot, { recursive: true, force: true }); });
beforeEach(async () => { await mongoose.connection.db.dropDatabase(); await seedReferenceData(); });

async function login(agent = request.agent(app)) {
  const response = await agent.post("/api/admin/auth/login").send(credentials).expect(200);
  const csrfCookie = response.headers["set-cookie"].find((item) => item.startsWith("morpho_admin_csrf="));
  return { agent, headers: { origin: "http://localhost:3000", "x-csrf-token": csrfCookie.split(";")[0].split("=")[1] } };
}
async function upload(agent, headers) {
  const image = await sharp({ create: { width: 80, height: 100, channels: 3, background: "black" } }).webp().toBuffer();
  const response = await agent.post("/api/admin/media").set(headers).attach("file", image, { filename: "fixture.webp", contentType: "image/webp" }).expect(201);
  return response.body;
}
function payload(asset, overrides = {}) { return { name: "Admin Test Design", slug: "admin-test-design", category: "oversized", garment_slug: "oversized", theme_slug: "toon-art", color_slug: "black", size_slugs: ["xs", "m", "xl"], images: [{ media_asset_id: asset.id, alt_text: "Test product", width: asset.width, height: asset.height, position: 0, role: "primary" }], availability: "available", display_order: 1, ...overrides }; }

describe("environment bootstrap", () => {
  test("loads the repository root .env values", async () => {
    const envModule = await import("../src/config/env.js");
    expect(envModule.env.ADMIN_USERNAME).toBe("test-admin");
    expect(envModule.env.FRONTEND_ORIGIN).toBe("http://localhost:3000");
  });
});

describe("catalog and health", () => {
  test("health, empty catalog, options, and unknown slug", async () => {
    expect(mongoose.connection.readyState).toBe(1);
    expect((await request(app).get("/health").expect(200)).body.status).toBe("ok");
    expect((await request(app).get("/api/products").expect(200)).body).toEqual({ items: [], page: 1, pageSize: 24, total: 0, pages: 0 });
    const options = (await request(app).get("/api/catalog/options").expect(200)).body;
    expect(options.garments.find((item) => item.id === "oversized").standardPrices.LKR.minorAmount).toBe(250000);
    await request(app).get("/api/products/missing").expect(404, { detail: "Product not found" });
  });
  test("pagination, filters, sorting, and authoritative pricing", async () => {
    const { agent, headers } = await login(); const asset = await upload(agent, headers);
    await agent.post("/api/admin/products").set(headers).send(payload(asset, { slug: "z-product", name: "Zulu" })).expect(201);
    await agent.post("/api/admin/products").set(headers).send(payload(asset, { slug: "a-product", name: "Alpha", garment_slug: "raglan", category: "raglan", color_slug: "red", size_slugs: ["2xl"] })).expect(201);
    const page = (await request(app).get("/api/products?pageSize=1&page=2").expect(200)).body; expect(page.total).toBe(2); expect(page.pages).toBe(2);
    const filtered = (await request(app).get("/api/products?garment=raglan&theme=toon-art&color=red&size=2xl").expect(200)).body; expect(filtered.items).toHaveLength(1); expect(filtered.items[0].prices.LKR.minorAmount).toBe(220000);
    const sorted = (await request(app).get("/api/products?sort=name-asc").expect(200)).body; expect(sorted.items.map((item) => item.name)).toEqual(["Alpha", "Zulu"]);
    await request(app).get("/api/products?page=0").expect(422);
  });
});

describe("admin authentication and mutations", () => {
  test("login, session, CSRF, logout, and unauthorized access", async () => {
    const agent = request.agent(app); await agent.post("/api/admin/auth/login").send({ username: "test-admin", password: "wrong" }).expect(401);
    await agent.get("/api/admin/dashboard").expect(401); const authenticated = await login(agent);
    await agent.get("/api/admin/dashboard").expect(200); await agent.post("/api/admin/products").send({}).expect(403);
    await agent.post("/api/admin/auth/logout").set(authenticated.headers).expect(204); await agent.get("/api/admin/dashboard").expect(401);
  });
  test("media validation, create, edit, duplicate slug, archive, and business rules", async () => {
    const { agent, headers } = await login(); const asset = await upload(agent, headers); expect(asset.width).toBe(80); expect(asset.storageKey).toMatch(/^products\//);
    await agent.post("/api/admin/media").set(headers).attach("file", Buffer.from("bad"), { filename: "bad.webp", contentType: "image/webp" }).expect(422);
    await agent.post("/api/admin/media").set(headers).attach("file", Buffer.from("GIF89a"), { filename: "bad.gif", contentType: "image/gif" }).expect(415);
    const created = (await agent.post("/api/admin/products").set(headers).send(payload(asset)).expect(201)).body; expect(created.prices.LKR.minorAmount).toBe(250000); expect(created.variants.map((v) => v.sizeId)).toEqual(["xs", "m", "xl"]);
    expect((await request(app).get("/api/products")).body.total).toBe(1); await agent.post("/api/admin/products").set(headers).send(payload(asset)).expect(422, { detail: "Product slug already exists" });
    await agent.post("/api/admin/products").set(headers).send(payload(asset, { slug: "bad-color", color_slug: "pink" })).expect(422);
    const updated = (await agent.patch(`/api/admin/products/${created.id}`).set(headers).send(payload(asset, { slug: "edited", name: "Edited", size_slugs: ["s", "l"], display_order: 3 })).expect(200)).body; expect(updated.id).toBe(created.id); expect(updated.variants.map((v) => v.sizeId)).toEqual(["s", "l"]);
    await agent.delete(`/api/admin/media/${asset.id}`).set(headers).expect(409); await agent.post(`/api/admin/products/${created.id}/archive`).set(headers).expect(204); expect((await request(app).get("/api/products")).body.total).toBe(0); await request(app).get("/api/products/edited").expect(404);
  });
  test("reference seed is idempotent", async () => { await seedReferenceData(); await seedReferenceData(); const options = (await request(app).get("/api/catalog/options")).body; expect(options.themes).toHaveLength(5); expect(options.garments).toHaveLength(2); });
});
