import { Request, Response, NextFunction } from "express";
import { z } from "zod";

const emailSchema = z
  .string()
  .email("Invalid email format")
  .transform(val => val.toLowerCase().trim());

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number");

const codeSchema = z
  .string()
  .length(6, "Verification code must be 6 digits")
  .regex(/^\d+$/, "Verification code must contain only numbers");

export const registerSchema = z.object({
  name: z.string().min(1, "Name is required").trim(),
  email: emailSchema,
  password:passwordSchema,
});

export const verifyCodeSchema = z.object({
  email:emailSchema,
  code: codeSchema
});

export const resendCodeSchema = z.object({
  email: emailSchema,
});

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const resetPassSchema = z.object({
  email: emailSchema,
  code : codeSchema,
  newPassword:passwordSchema
});

export const sendMessageSchema = z.object({
    content: z.string().min(1).max(2000),
    sender: z.enum(["user", "ai"]).optional(),
});


export const validate = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsedData = schema.parse(req.body);
      req.body = parsedData; // ✅ overwrite with transformed data
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: error.issues.map(e => ({
            field: e.path.join('.'),
            message: e.message
          }))
        });
      }
      next(error);
    }
  };
};