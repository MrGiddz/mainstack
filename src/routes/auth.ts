import { Router } from "express";

import Validate from "../lib/validator";
import { loginSchema, resetPasswordSchema, signupSchema, verifyOtpSchema } from "../schemas/index";
import { login, register, requestPasswordReset, verifyRequestPasswordReset } from "../controllers/auth.controller";

export default (router: Router) => {
  const auth = Router();

  auth.post("/register", Validate(signupSchema), register);
  auth.post("/login", Validate(loginSchema), login);
  auth.post("/request-password-reset", Validate(resetPasswordSchema), requestPasswordReset);
  auth.post("/verify-password-reset", Validate(verifyOtpSchema), verifyRequestPasswordReset);

  router.use("/auth", auth);
};
