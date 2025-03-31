import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";
import { database } from "./database";
import { seedRoles } from "./utils/seedRoles";
import { usersModule } from "./users";
import { ApiError } from "./utils/error-handlers";
import { proxy } from "./proxy";

// Create the main application
const app = new Elysia({
  cookie: {
    domain: Bun.env.DOMAIN || "localhost",
    //httpOnly: true,
    //secure: true,
    secrets: ["SECRET_KEY"],
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7 // 7 days
  }
})
  .use(database)
  .use(cors({
    origin: Bun.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true
  }))
  .use(swagger({
    documentation: {
      info: {
        title: "User Management API",
        version: "1.0.0"
      }
    }
  }))
  .use(proxy)
  .use(usersModule)
  .onError(({ code, error, set }) => {
    // Handle custom API errors
    if (error instanceof ApiError) {
      set.status = error.status;
      return {
        success: false,
        error: error.message,
        code: error.code
      };
    }

    if (code === "NOT_FOUND") {
      set.status = 404;
      return { success: false, error: "Not found" };
    }

    if (code === "VALIDATION") {
      set.status = 400;
      return { success: false, error: error.message };
    }

    console.error(`Error: [${code}]`, error);

    set.status = 500;
    return { success: false, error: "Internal server error" };
  })
  .listen(Bun.env.PORT || 3000);

// Seed default roles
seedRoles().catch(console.error);

console.log(
  `🦊 Server is running at ${app.server?.hostname}:${app.server?.port}`
);

export type Backend = typeof app;

