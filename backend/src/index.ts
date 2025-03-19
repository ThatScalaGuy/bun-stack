import { Elysia } from "elysia";

import { proxy } from "./proxy";
import swagger from "@elysiajs/swagger";
import serverTiming from "@elysiajs/server-timing";
import cors from "@elysiajs/cors";
const app = new Elysia()
  .use(serverTiming())
  .use(swagger())
  .use(cors())
  .get("/hi", () => "Hello Elysia")
  .mount(proxy)
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
