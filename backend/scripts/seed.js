import { connectDatabase, disconnectDatabase } from "../src/config/database.js";
import { seedReferenceData } from "../src/services/seed.js";

await connectDatabase(); await seedReferenceData(); await disconnectDatabase(); console.log("Reference data seeded");
