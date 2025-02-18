import { NextFunction, Request, Response } from "express";
import { User } from "../models/user.model";
import { SECRET_KEY } from "../lib/config";
import jwt from "jsonwebtoken";
import logger from "../lib/logger";

export interface AuthRequest extends Request {
  user: User;
}

// Helper function to validate the token payload type
const isUser = (data: any): data is User => {
  return data && typeof data === "object" && "username" in data && "id" in data;
};

// Middleware to authenticate the user
export const authenticateUser = (
  req: Request & { user?: User },
  res: Response,
  next: NextFunction
) => {
  const token = req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .json({ error: "Unauthorized", message: "No token provided" });
  }

  jwt.verify(token, SECRET_KEY, (err, userData) => {
    if (err) {
      logger.error(`Token verification error: ${err.message}`);
      return res.status(403).json({ error: "Forbidden", message: err.message });
    }

    if (isUser(userData)) {
      req.user = userData;
      return next();
    }

    const errorMessage = "Invalid token payload";
    logger.error(errorMessage);
    return res.status(403).json({ error: "Forbidden", message: errorMessage });
  });
};
