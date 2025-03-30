import Elysia from "elysia";
import { join } from "path";
import { existsSync } from "fs";
import { FRONTEND_ASSETS_PATH } from "./utils/env";

const FRONTEND_SERVER = 'http://localhost:5173';
const BACKEND_SERVER = 'http://localhost:3000';

/**
 * Handles proxying requests to the frontend development server.
 * Used in development mode to forward requests from the backend to the Vite dev server.
 * @param {Object} options - The request object
 * @param {Request} options.request - The original HTTP request
 * @returns {Promise<Response>} The proxied response from the frontend server
 */
const proxyHandler = async ({ request }: { request: Request }) => {
    // Construct the target URL
    const targetUrl = new URL(request.url.replace(BACKEND_SERVER, FRONTEND_SERVER));

    // Copy original request
    const proxyRequest = new Request(targetUrl, {
        ...request
    });
    // Forward the request and return the response
    return await fetch(proxyRequest);
};

/**
 * Serves static files from the built frontend assets directory.
 * Used in production mode to serve the compiled frontend assets directly from the backend.
 * Implements SPA fallback by serving index.html for routes that don't match physical files.
 * @param {Object} options - The request object
 * @param {Request} options.request - The original HTTP request
 * @returns {Promise<Response>} Response with the requested file or index.html as fallback
 */
const serveStatic = async ({ request }: { request: Request }) => {
    const url = new URL(request.url);
    const assetsPath = FRONTEND_ASSETS_PATH!;

    // Extract the path from the URL
    let filePath = url.pathname;
    if (filePath === '/') filePath = '/index.html';

    // Create full path to the file
    const fullPath = join(assetsPath, filePath);

    // Check if the file exists
    if (existsSync(fullPath) && !fullPath.includes('..')) {
        // File exists, serve it
        const file = Bun.file(fullPath);
        const headers = new Headers();

        // Add content type header based on file extension
        headers.set("Content-Type", file.type);

        // Set caching headers for all files except index.html
        if (!filePath.endsWith('index.html')) {
            // Cache for 1 week (604800 seconds)
            headers.set("Cache-Control", "public, max-age=604800, immutable");
        } else {
            // No caching for index.html
            headers.set("Cache-Control", "no-store, max-age=0");
        }

        return new Response(file, { headers });
    } else {
        // File doesn't exist, serve index.html as fallback
        const indexFile = Bun.file(join(assetsPath, 'index.html'));
        const headers = new Headers();
        headers.set("Content-Type", "text/html");
        headers.set("Cache-Control", "no-store, max-age=0");
        return new Response(indexFile, { headers });
    }
};

/**
 * Builds and returns the appropriate proxy middleware based on the environment.
 * If FRONTEND_ASSETS_PATH is defined (production), serves static files.
 * Otherwise (development), proxies requests to the frontend dev server.
 * @returns {Elysia} Configured Elysia instance with the appropriate handler
 */
const buildProxy = () => {
    if (FRONTEND_ASSETS_PATH) {
        return new Elysia().all('/*', serveStatic);
    } else {
        return new Elysia().all('/*', proxyHandler);
    }
};

export const proxy = buildProxy();