import Elysia from "elysia";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { Database } from "bun:sqlite";

import { migrate } from "drizzle-orm/bun-sqlite/migrator";
import { DATA_PATH } from "../utils/env";
const sqlite = new Database(`${DATA_PATH}/application.db`);
export const connection = drizzle(sqlite);
migrate(connection, { migrationsFolder: "./drizzle" });
export const database = new Elysia({
    name: "db",
})
    .decorate("db", connection)
