import "dotenv/config";
import { connectDatabase, disconnectDatabase, sanitizeDatabaseError } from "../config/database.js";
import { validateEnvironment } from "../config/environment.js";
import User from "../models/userModel.js";

async function run() {
    const email = String(process.env.ADMIN_EMAIL ?? "").trim().toLowerCase()
    if (!email) throw new Error("Set ADMIN_EMAIL to an existing registered user")
    const { databaseUrl } = validateEnvironment()
    await connectDatabase(databaseUrl)
    const user = await User.findOne({ email })
    if (!user) throw new Error("No registered user matches ADMIN_EMAIL")
    user.type = "admin"
    await user.save()
    console.log("Administrator role granted to the requested existing user")
}

run().catch((error) => { console.error(`Admin promotion failed: ${sanitizeDatabaseError(error)}`); process.exitCode = 1 }).finally(disconnectDatabase)
