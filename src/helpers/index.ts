import crypto from "crypto";
import { OTP_SECRET, SECRET_KEY } from "../lib/config";
import jwt from "jsonwebtoken";

export const random = crypto.randomBytes(128).toString("base64");

export const generateSetupToken = (email: string): string => {
  const TOKEN_EXPIRATION = "24h";
  return jwt.sign({ email }, SECRET_KEY, { expiresIn: TOKEN_EXPIRATION });
};

export function generateOtp(interval: number): { otp: string; expiresAt: Date } {
  const secret = OTP_SECRET;
  const hash = crypto
    .createHmac("sha256", secret)
    .update(Date.now().toString())
    .digest("hex");

  const otp = parseInt(hash.substring(0, 6), 16) % 1000000;
  const expiresAt = new Date(Date.now() + interval * 60 * 1000);

  return { otp: otp.toString().padStart(6, "0"), expiresAt };
}
