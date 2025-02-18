import { HttpStatusCode } from "axios";
import { Request, Response } from "express";
import logger from "../lib/logger";
import UserModel, { User } from "../models/user.model";
import generateTokens, { JWTPayloadType } from "../lib/generate-tokens";
import { generateOtp } from "../helpers/index";
import { emailQueue } from "../queues/email-queue";

export const register = async (req: Request, res: Response) => {
  try {
    const { username, password, email } = req.body;

    // Validate input
    if (!username || !password || !email) {
      return res
        .status(HttpStatusCode.BadRequest)
        .json({ error: "Your credentials are invalid, please check." });
    }

    // Another validation for password length
    if (password.length < 6) {
      return res
        .status(HttpStatusCode.BadRequest)
        .json({ error: "Password should be at least 8 characters long." });
    }

    const isUsernameExists = await UserModel.findByUsername(username);
    if (isUsernameExists) {
      return res
        .status(HttpStatusCode.Conflict)
        .json({ message: "Account already exists" });
    }

    const user = await UserModel.createUser(username, password, email);

    return res.status(HttpStatusCode.Created).json({ user });
  } catch (error) {
    logger.error(error);
    return res
      .status(HttpStatusCode.InternalServerError)
      .json({ error: "An unexpected error occurred. Please try again later." });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body as User;

    if (!username || !password) {
      return res
        .status(HttpStatusCode.BadRequest)
        .json({ error: "Invalid email or password" });
    }

    const user = await UserModel.findByUsername(username);

    if (!user)
      return res
        .status(HttpStatusCode.Unauthorized)
        .json({ message: "Invalid username or password" });

    const isPasswordMatch = await user.comparePassword(password);

    if (!isPasswordMatch)
      return res
        .status(HttpStatusCode.Unauthorized)
        .json({ message: "Invalid username or password" });

    const tokens = generateTokens(user);

    user.setRefreshToken(tokens.refreshToken, tokens.refreshTokenExpiresAt);

    return res.status(HttpStatusCode.Created).json({ user, ...tokens });
  } catch (error) {
    logger.error(error);
    return res
      .status(HttpStatusCode.InternalServerError)
      .json({ error: "An Error occurred, please try again." });
  }
};

export const requestPasswordReset = async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) {
    return res
      .status(HttpStatusCode.BadRequest)
      .json({ error: "Email not provided." });
  }

  const user = await UserModel.findByEmail(email);
  if (!user) return res.sendStatus(HttpStatusCode.NotFound);

  const interval = 1;
  const otp = generateOtp(interval);

  console.log({ otp });

  // save the otp
  await user.setPasswordResetToken(otp.otp, otp.expiresAt);

  await emailQueue.add("sendResetEmail", {
    to: email,
    subject: "Reset Password",
    text: `Your password reset OTP: ${otp.otp}. OTP expires in ${interval} mins`,
  });

  return res.status(200).json({ message: "Password reset email sent." });
};

export const verifyRequestPasswordReset = async (
  req: Request,
  res: Response
) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res
      .status(HttpStatusCode.BadRequest)
      .json({ error: "Email and OTP are required." });
  }

  const user = await UserModel.findByEmail(email);
  if (!user) {
    return res
      .status(HttpStatusCode.NotFound)
      .json({ error: "User not found." });
  }

  if (!user.auth.resetPasswordOTP || !user.auth.resetPasswordOTPExpires) {
    return res
      .status(HttpStatusCode.BadRequest)
      .json({ error: "OTP not found or expired." });
  }

  // Check if OTP is valid and not expired
  if (user.auth.resetPasswordOTP !== otp) {
    return res
      .status(HttpStatusCode.Unauthorized)
      .json({ error: "Invalid OTP." });
  }

  if (new Date() > user.auth.resetPasswordOTPExpires) {
    return res.status(HttpStatusCode.Gone).json({ error: "OTP expired." });
  }

  // OTP is valid, clear it from the user record
  await user.setPasswordResetToken(null, null);

  return res
    .status(HttpStatusCode.Ok)
    .json({ message: "OTP verified successfully." });
};
