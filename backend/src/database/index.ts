import { Elysia } from "elysia";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { Database } from "bun:sqlite";
import { migrate } from "drizzle-orm/bun-sqlite/migrator";

// Import the environment variables
const DATA_PATH = Bun.env.DATA_PATH || "./.data";

// Create sqlite database connection
const sqlite = new Database(`${DATA_PATH}/application.db`);
export const connection = drizzle(sqlite, { logger: true });

// Run migrations
migrate(connection, { migrationsFolder: "./drizzle" });

// Create Elysia plugin for database
export const database = new Elysia({
    name: "db",
})
    .decorate("db", connection)
    .onStart(() => {
        console.log("📚 Database connected");
    })
    .onStop(() => {
        console.log("📚 Database disconnected");
        sqlite.close();
    });
