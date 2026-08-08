import { fileURLToPath } from "node:url";

import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";

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

app.get("/health", (req, res) => {
    res.json({
        success : true,
        data : {
            status : "ok"
        }
    })
})

app.use("/api/users", userRouter)
app.use("/api/items", itemRouter)
app.use("/api/categories", categoryRouter)
app.use("/api/gallery", galleryRouter)
app.use("/api/inventory", inventoryRouter)
app.use("/api/orders", orderRouter)
app.use("/api/cart", cartRouter)
app.use("/api/wishlist", wishlistRouter)
app.use("/api/reviews", reviewRouter)
app.use("/api/customizations", customizationRequestRouter)

app.use((req, res) => sendError(res, 404, "Route not found"))

app.use((error, req, res, next) => {
    if (error?.type === "entity.parse.failed") {
        return sendError(res, 400, "Invalid JSON body")
    }

    console.error(error)
    return sendError(res, 500, "An unexpected server error occurred")
})

export function startServer() {
    const database = process.env.DATABASE_URL
    const port = Number(process.env.PORT) || 4200

    if (database) {
        mongoose.connect(database).then(
            () => console.log("Connected to the Database")
        ).catch(
            () => console.log("Couldn't connect to the Database")
        )
    } else {
        console.log("DATABASE_URL is not configured")
    }

    return app.listen(port, () => {
        console.log(`Server is running on http://localhost:${port}/`)
    })
}

const isEntryPoint = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]
if (isEntryPoint) startServer()

export default app;
