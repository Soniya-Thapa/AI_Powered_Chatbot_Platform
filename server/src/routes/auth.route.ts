import { Router } from "express";
import { forgotPassword, loginUser, logoutUser, registerUser, resendCode, resetPassword, verifyCode } from "../controllers/auth.controller";
import { loginSchema, registerSchema, resendCodeSchema, resetPassSchema, validate, verifyCodeSchema } from "../middlewares/validation.middleware";

const router = Router();

// POST request for auth
router.post("/register", validate(registerSchema), registerUser);
router.post("/verify-code", validate(verifyCodeSchema), verifyCode);
router.post("/resend-code", validate(resendCodeSchema), resendCode);
router.post("/login", validate(loginSchema), loginUser);
router.post("/forgot-password", validate(resendCodeSchema), forgotPassword);
router.post("/reset-password",validate(resetPassSchema), resetPassword);
router.post("/logout", logoutUser);

export default router;
