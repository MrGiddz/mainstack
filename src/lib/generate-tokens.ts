import jwt from "jsonwebtoken";
import { User } from "../models/user.model";
import { REFRESH_SECRET_KEY, SECRET_KEY } from "./config";

export interface JWTPayloadType { 
  id: string;
  username: string;
}

const generateTokens = (user: User) => {
  const jwtUserPayload: JWTPayloadType = {
    id: user.id,
    username: user.username,
  };

  const accessTokenExpiresAt = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour
  const refreshTokenExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  const accessToken = jwt.sign(jwtUserPayload, SECRET_KEY, { expiresIn: "1h" });
  const refreshToken = jwt.sign(jwtUserPayload, REFRESH_SECRET_KEY, {
    expiresIn: "7d",
  });

  return {
    accessToken,
    accessTokenExpiresAt,
    refreshToken,
    refreshTokenExpiresAt,
  };
};

export default generateTokens;
