import dotenv from "dotenv";

dotenv.config();

// Load environment variables
export const MONGODB_URL = process.env.DATABASE_URL as string;
export const PORT = Number(process.env.PORT) || 9000;
export const SECRET_KEY = process.env.AUTH_SECRET_KEY as string;
export const REFRESH_SECRET_KEY = process.env.AUTH_REFRESH_SECRET_KEY as string;
export const MAIL_HOST = process.env.MAIL_HOST as string;
export const MAIL_PORT = Number(process.env.MAIL_PORT);
export const MAIL_SECURE = process.env.MAIL_SECURE === "true";
export const MAIL_USERNAME = process.env.MAIL_USERNAME as string;
export const MAIL_PASSWORD = process.env.MAIL_PASSWORD as string;
export const OTP_SECRET = process.env.OTP_SECRET as string;

export const redisConfig = {
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: Number(process.env.REDIS_PORT) || 6379,
};

// function to check required environment variables
const checkRequiredEnvVars = (vars: string[]) => {
  vars.forEach((variable) => {
    if (!process.env[variable]) {
      throw new Error(`Environment variable ${variable} is not set!`);
    }
  });
};

checkRequiredEnvVars([
  "AUTH_SECRET_KEY",
  "OTP_SECRET",
  "AUTH_REFRESH_SECRET_KEY",
  "PORT",
  "DATABASE_URL",
  "MAIL_HOST",
  "MAIL_PORT",
  "MAIL_SECURE",
  "MAIL_PASSWORD",
  "MAIL_USERNAME",
]);
