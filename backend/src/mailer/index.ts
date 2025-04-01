import Elysia from "elysia";
import { createTransport } from "nodemailer"

export const transporter = createTransport(Bun.env.SMTP_CONNECTION_URL)
export const mail = new Elysia({ name: 'mail' })

    .as('plugin')