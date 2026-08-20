export function validateEnvironment(environment = process.env) {
    const required = ["DATABASE_URL", "JWT_KEY"]
    const missing = required.filter((key) => !environment[key]?.trim())
    if (missing.length) throw new Error(`Missing required environment variables: ${missing.join(", ")}`)
    const databaseUrl = environment.DATABASE_URL.trim()
    if (!/^mongodb(?:\+srv)?:\/\//i.test(databaseUrl)) throw new Error("DATABASE_URL must be a MongoDB driver URI")
    const cloudinary = ["CLOUDINARY_CLOUD_NAME", "CLOUDINARY_API_KEY", "CLOUDINARY_API_SECRET"]
    const supplied = cloudinary.filter((key) => environment[key]?.trim())
    if (supplied.length > 0 && supplied.length < cloudinary.length) throw new Error("Cloudinary configuration is incomplete")
    const port = Number(environment.PORT ?? 4200)
    if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error("PORT must be a valid TCP port")
    return { databaseUrl, port }
}
