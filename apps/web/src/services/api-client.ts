import ky from "ky";
import { env } from "@/config/env";

export const apiClient = ky.create({
  prefixUrl: env.NEXT_PUBLIC_API_URL,
  timeout: 10_000,
  retry: { limit: 1 },
});
