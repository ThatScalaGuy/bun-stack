import Elysia from "elysia";
import { staticPlugin } from '@elysiajs/static'

const TARGET_SERVER = 'http://localhost:5173';

const proxyHandler = async ({ request, path }: { request: Request, path: string }) => {
    // Construct the target URL
    const targetUrl = new URL(request.url.replace("http://localhost:3000", TARGET_SERVER));

    // Copy original request
    const proxyRequest = new Request(targetUrl, {
        ...request
    });
    // Forward the request and return the response
    return await fetch(proxyRequest);
};

const buildProxy = () => {
    if (Bun.env.FRONTEND_ASSETS_PATH) {
        return new Elysia().use(staticPlugin({
            prefix: '/',
            assets: Bun.env.FRONTEND_ASSETS_PATH
        }))
    } else {
        return new Elysia().all('/*', proxyHandler)
    }
}

export const proxy = buildProxy();