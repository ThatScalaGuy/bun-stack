import Elysia from "elysia";
import { createTransport } from "nodemailer"

export const transporter = createTransport(Bun.env.SMTP_CONNECTION_URL)
await transporter.verify()
export const mailer = new Elysia({ name: 'mail' })
    .derive(() => ({
        transporter,
        mail: transporter.sendMail.bind(transporter),
    }))
    .as('plugin')