import z from "zod";

export const signupSchema = z.object({
  username: z
    .string()
    .min(2, "Username must be at least 4 characters")
    .max(12, "Username must be less than 45 characters"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(50, "Password must be less than 50 characters"),
});

export type SignupType = z.infer<typeof signupSchema>;

export const loginSchema = z.object({
  username: z
    .string()
    .min(2, "Username must be at least 4 characters")
    .max(12, "Username must be less than 45 characters"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(50, "Password must be less than 50 characters"),
});

export type LoginSchema = z.infer<typeof loginSchema>;

export const resetPasswordSchema = z.object({
  email: z.string().email(),
});

export type ResetPasswordType = z.infer<typeof resetPasswordSchema>;

export const verifyOtpSchema = z.object({
  otp: z
    .string()
    .min(6, "OTP must be at least 5 characters")
    .max(6, "OTP must be less than 5 characters"),
});

export type VerifyOtpType = z.infer<typeof verifyOtpSchema>;

export const createProductSchema = z.object({
  name: z.string(),
  price: z.number(),
  quantity: z.number(),
});

export type CreateProductType = z.infer<typeof createProductSchema>;
