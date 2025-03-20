import Elysia from "elysia";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { Database } from "bun:sqlite";

import { migrate } from "drizzle-orm/bun-sqlite/migrator";
console.log("Database is running");

const sqlite = new Database("sqlite.db");
export const connection = drizzle(sqlite);
migrate(connection, { migrationsFolder: "./drizzle" });
export const database = new Elysia({
    name: "db",
})
    .decorate("db", connection)
