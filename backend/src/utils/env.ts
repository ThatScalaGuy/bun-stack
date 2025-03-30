import fs from "fs";
export const DATA_PATH = process.env.DATA_PATH || "./.data";
if (!fs.existsSync(DATA_PATH)) {
    // Create the directory if it doesn't exist
    console.log(`Creating data directory at ${DATA_PATH}`);
    fs.mkdirSync(DATA_PATH, { recursive: true });
}

export const FRONTEND_ASSETS_PATH = Bun.env.FRONTEND_ASSETS_PATH
