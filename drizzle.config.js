import { defineConfig } from "drizzle-kit";
import { env } from "./src/common/env.js";

export default defineConfig({
  dialect: "sqlite",
  schema: "./src/db/schema/index.js",
  out: "./src/db/migrations",
  dbCredentials: {
    url: env.DATABASE_URL
  }
});
