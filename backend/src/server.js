import { app } from "./app.js";
import { connectDatabase, disconnectDatabase } from "./config/database.js";
import { env, assertAuthEnvironment } from "./config/env.js";

assertAuthEnvironment();

let databaseReady = false;
async function startServer() {
  try {
    await connectDatabase();
    databaseReady = true;
  } catch (error) {
    console.error("MongoDB connection failed during startup:", error.message);
  }

  const server = app.listen(env.PORT, "0.0.0.0", () => {
    const status = databaseReady ? "ready" : "starting-without-database";
    console.log(`MORPHO API listening on ${env.PORT} (${status})`);
  });

  async function shutdown() {
    server.close();
    if (databaseReady) await disconnectDatabase();
    process.exit(0);
  }

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

await startServer();
