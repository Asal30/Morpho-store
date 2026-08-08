import { defineConfig } from "vitest/config";

export default defineConfig({ test: { hookTimeout: 600000, testTimeout: 30000, fileParallelism: false } });
