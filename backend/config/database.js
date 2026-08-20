import mongoose from "mongoose";

let eventsRegistered = false

function registerConnectionEvents() {
    if (eventsRegistered) return
    eventsRegistered = true
    mongoose.connection.on("connected", () => console.log("MongoDB connected"))
    mongoose.connection.on("disconnected", () => console.warn("MongoDB disconnected"))
    mongoose.connection.on("reconnected", () => console.log("MongoDB reconnected"))
    mongoose.connection.on("error", (error) => console.error(`MongoDB connection error: ${sanitizeDatabaseError(error)}`))
}

export function sanitizeDatabaseError(error) {
    const message = String(error?.message ?? "Unknown database error")
    return message
        .replace(/mongodb(?:\+srv)?:\/\/[^\s]+/gi, "[redacted MongoDB URI]")
        .replace(/_mongodb\._tcp\.[\w.-]+/gi, "[redacted MongoDB SRV host]")
        .replace(/(password|passwd|pwd)=([^&\s]+)/gi, "$1=[redacted]")
}

export async function connectDatabase(uri = process.env.DATABASE_URL) {
    if (!uri) throw new Error("DATABASE_URL is not configured")
    registerConnectionEvents()
    if (mongoose.connection.readyState === 1) return mongoose.connection
    await mongoose.connect(uri.trim(), { serverSelectionTimeoutMS : 10000 })
    return mongoose.connection
}

export async function disconnectDatabase() {
    if (mongoose.connection.readyState !== 0) await mongoose.disconnect()
}

export function getDatabaseState() {
    const states = ["disconnected", "connected", "connecting", "disconnecting"]
    return { readyState : mongoose.connection.readyState, status : states[mongoose.connection.readyState] ?? "unknown", isReady : mongoose.connection.readyState === 1 }
}
