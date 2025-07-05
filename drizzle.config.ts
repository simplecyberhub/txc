import { defineConfig } from "drizzle-kit";
import "dotenv/config";

import { config } from "dotenv";
config();

if (!process.env.DATABASE_HOST) {
  throw new Error(
    "DATABASE_HOST is not set. Ensure the database host is configured.",
  );
}
if (!process.env.DATABASE_PORT) {
  throw new Error(
    "DATABASE_PORT is not set. Ensure the database port is configured.",
  );
}
if (!process.env.DATABASE_USER) {
  throw new Error(
    "DATABASE_USER is not set. Ensure the database user is configured.",
  );
}
if (!process.env.DATABASE_PASSWORD) {
  throw new Error(
    "DATABASE_PASSWORD is not set. Ensure the database password is configured.",
  );
}
if (!process.env.DATABASE_NAME) {
  throw new Error(
    "DATABASE_NAME is not set.  Ensure the database name is configured.",
  );
}

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    host: process.env.DATABASE_HOST || "",
    port: Number(process.env.DATABASE_PORT || 5432),
    user: process.env.DATABASE_USER || "",
    password: process.env.DATABASE_PASSWORD || "",
    database: process.env.DATABASE_NAME || "",
    ssl: { rejectUnauthorized: false }, // Force SSL, accept self-signed
  },
});
