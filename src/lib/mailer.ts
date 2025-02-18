import nodemailer from "nodemailer";
import z from "zod";
import axios from "axios";
import { MAIL_HOST, MAIL_PASSWORD, MAIL_PORT, MAIL_USERNAME } from "./config";
import logger from "../lib/logger";

const MailerSchema = z.object({
  to: z.string().email("Please enter a valid email address"),
  subject: z.string(),
  text: z.string(),
  html: z.optional(z.string()),
});

export type MailerType = z.infer<typeof MailerSchema>;

export async function Mailer({ to, subject, text, html }: MailerType) {
  try {
    const transporter = nodemailer.createTransport({
      host: MAIL_HOST,
      port: MAIL_PORT,
      secure: true,
      auth: {
        user: MAIL_USERNAME,
        pass: MAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: `"Main Stack" <${MAIL_USERNAME}>`,
      to,
      subject,
      text,
      html,
    };

    const info = await transporter.sendMail(mailOptions);

    return info;
  } catch (error) {
    logger.error(error);
    throw new Error("An error occurred sending mail: " + error);
  }
}
