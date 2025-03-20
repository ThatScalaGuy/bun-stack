import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const movies = sqliteTable("movies", {
    id: integer("id").primaryKey(),
    title: text("name"),
    releaseYear: integer("release_year"),
});

export const tables = {
    movies
} as const

export type Tables = typeof tables