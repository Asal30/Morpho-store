import { fileURLToPath } from "node:url";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { configureCloudinary } from "./config/cloudinary.js";
import { connectDatabase, disconnectDatabase, getDatabaseState, sanitizeDatabaseError } from "./config/database.js";
import { validateEnvironment } from "./config/environment.js";
import cartRouter from "./routes/cartRoute.js";
import categoryRouter from "./routes/categoryItemsRoute.js";
import customizationRequestRouter from "./routes/customizationRequestRoute.js";
import galleryRouter from "./routes/galleryItemRoute.js";
import inventoryRouter from "./routes/inventoryRoute.js";
import itemRouter from "./routes/itemRoute.js";
import orderRouter from "./routes/orderRoute.js";
import reviewRouter from "./routes/reviewRoute.js";
import userRouter from "./routes/usersRoute.js";
import wishlistRouter from "./routes/wishlistRoute.js";
import { sendError } from "./utilities/http.js";

dotenv.config()
const app = express()
app.use(cors())
app.use(bodyParser.json())
app.get("/health", (req, res) => res.json({ success : true, data : { status : "ok" } }))
app.get("/ready", (req, res) => { const state = getDatabaseState(); return state.isReady ? res.json({ success : true, data : { status : "ready", database : "connected" } }) : sendError(res, 503, "Database is not ready") })
app.use("/api/users", userRouter); app.use("/api/items", itemRouter); app.use("/api/categories", categoryRouter); app.use("/api/gallery", galleryRouter); app.use("/api/inventory", inventoryRouter); app.use("/api/orders", orderRouter); app.use("/api/cart", cartRouter); app.use("/api/wishlist", wishlistRouter); app.use("/api/reviews", reviewRouter); app.use("/api/customizations", customizationRequestRouter)
app.use((req, res) => sendError(res, 404, "Route not found"))
app.use((error, req, res, next) => { if (error?.type === "entity.parse.failed") return sendError(res, 400, "Invalid JSON body"); console.error(error); return sendError(res, 500, "An unexpected server error occurred") })

export async function startServer() {
    const { databaseUrl, port } = validateEnvironment()
    configureCloudinary()
    await connectDatabase(databaseUrl)
    const server = app.listen(port, () => console.log(`MORPHO API listening on port ${port}`))
    let shuttingDown = false
    const shutdown = async (signal) => { if (shuttingDown) return; shuttingDown = true; console.log(`${signal} received; shutting down`); server.close(async (error) => { try { await disconnectDatabase() } finally { process.exitCode = error ? 1 : 0 } }) }
    process.once("SIGINT", () => void shutdown("SIGINT")); process.once("SIGTERM", () => void shutdown("SIGTERM"))
    return server
}
const isEntryPoint = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]
if (isEntryPoint) startServer().catch((error) => { console.error(`Server startup failed: ${sanitizeDatabaseError(error)}`); process.exitCode = 1 })
export default app;
