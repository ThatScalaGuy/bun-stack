import { Elysia, t } from "elysia";

import { proxy } from "./proxy";
import swagger from "@elysiajs/swagger";
import serverTiming from "@elysiajs/server-timing";
import cors from "@elysiajs/cors";
import { sql } from "drizzle-orm";
import { database } from "./database";
import { createInsertSchema, createSelectSchema, createUpdateSchema } from 'drizzle-typebox'
import { tables } from "./database/schema";

const _createMovie = createInsertSchema(tables.movies)
const _findMovie = createSelectSchema(tables.movies)
const _updateMovie = createUpdateSchema(tables.movies)


const app = new Elysia()
  .use(serverTiming())
  .use(swagger())
  .use(cors())
  .use(database)
  .get("/hi/:id", ({ params, db }) => {
    const query = sql`select "hello world" as text`;
    const result = db.get<{ text: string }>(query);
    return "Hello Elysia 2" + result + params.id
  }, {
    params: t.Object({
      id: t.String()
    })
  })
  .mount(proxy)
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);

export type Backend = typeof app 