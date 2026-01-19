import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../prisma.client";
import { envConfig } from "../env-config/config";
import { sendVerificationEmail, sendWelcomeEmail } from "../services/email.service";

// Generate 6-digit code
const generateVerificationCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const registerUser = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { name, email, password } = req.body;
    
    if (!email || !name || !password) {
      return res.status(400).json({
        success: false,
        message: "Email, name and password are required"
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      // If user exists but not verified, resend code
      if (!existingUser.isVerified) {
        const verificationCode = generateVerificationCode();
        const codeExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        await prisma.user.update({
          where: { id: existingUser.id },
          data: {
            verificationCode,
            codeExpiry
          }
        });

        // Try to send email - don't fail if it doesn't work
        const emailResult = await sendVerificationEmail(email, verificationCode, existingUser.name);
        
        const message = emailResult.success 
          ? "Verification code sent to your email"
          : "Verification code generated. Check server logs if email not received.";

        return res.status(200).json({
          success: true,
          message,
          data: {
            email: existingUser.email,
            needsVerification: true
          }
        });
      }

      return res.status(409).json({
        success: false,
        message: "User with this email already exists"
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Generate 6-digit code
    const verificationCode = generateVerificationCode();
    const codeExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Create user
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email,
        password: hashedPassword,
        isVerified: false,
        verificationCode,
        codeExpiry,
      },
      select: {
        id: true,
        name: true,
        email: true,
        isVerified: true,
      }
    });

    console.log('✅ User created successfully:', user.id);

    // Try to send email - but don't fail registration if email fails
    const emailResult = await sendVerificationEmail(email, verificationCode, name);
    
    if (emailResult.success) {
      console.log('✅ Verification email sent to:', email);
    } else {
      console.log('⚠️ Email failed but registration succeeded');
      console.log('📧 Verification code for', email, ':', verificationCode);
    }

    // Always return success - user is registered
    const message = emailResult.success
      ? "Registration successful! Please check your email for verification code."
      : "Registration successful! Verification code has been generated.";

    return res.status(201).json({
      success: true,
      message,
      data: {
        ...user,
        needsVerification: true,
      }
    });

  } catch (error) {
    console.error("Error in the register controller: ", error);
    return res.status(500).json({
      success: false,
      message: "Registration failed"
    });
  }
};

const verifyCode = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { email, code } = req.body;

    // Validation
    if (!email || !code) {
      return res.status(400).json({
        success: false,
        message: "Email and verification code are required"
      });
    }

    if (code.length !== 6 || !/^\d+$/.test(code)) {
      return res.status(400).json({
        success: false,
        message: "Verification code must be 6 digits"
      });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Check if already verified
    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "Email is already verified"
      });
    }

    // Check if code exists
    if (!user.verificationCode || !user.codeExpiry) {
      return res.status(400).json({
        success: false,
        message: "No verification code found. Please request a new code."
      });
    }

    // Check if code expired
    if (new Date() > user.codeExpiry) {
      return res.status(400).json({
        success: false,
        message: "Verification code has expired. Please request a new code."
      });
    }

    // Check if code matches
    if (user.verificationCode !== code) {
      return res.status(400).json({
        success: false,
        message: "Invalid verification code"
      });
    }

    // Verify user
    await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        verificationCode: null,
        codeExpiry: null
      }
    });

    console.log('✅ User verified successfully:', user.email);

    // Try to send welcome email (non-critical)
    await sendWelcomeEmail(email, user.name);

    return res.status(200).json({
      success: true,
      message: "Email verified successfully! You can now login."
    });

  } catch (error) {
    console.error("Error in verifyCode:", error);
    return res.status(500).json({
      success: false,
      message: "Verification failed. Please try again."
    });
  }
};

const resendCode = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required"
      });
    }

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "Email is already verified"
      });
    }

    // Generate new code
    const verificationCode = generateVerificationCode();
    const codeExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await prisma.user.update({
      where: { id: user.id },
      data: {
        verificationCode,
        codeExpiry
      }
    });

    // Try to send email - don't fail if it doesn't work
    const emailResult = await sendVerificationEmail(email, verificationCode, user.name);
    
    const message = emailResult.success
      ? "New verification code sent to your email"
      : "New verification code generated. Check server logs if email not received.";

    return res.status(200).json({
      success: true,
      message
    });

  } catch (error) {
    console.error("Error in resendCode:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to resend verification code"
    });
  }
};

const loginUser = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required"
      });
    }
    
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    // ✅ Check if email is verified
    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your email before logging in",
        needsVerification: true,
        email: user.email
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      envConfig.jwtSecretKey!,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
        token
      }
    });

  } catch (error) {
    console.error("Error in loginUser:", error);
    return res.status(500).json({
      success: false,
      message: "Login failed. Please try again later."
    });
  }
};

const forgotPassword = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required"
      });
    }

    const user = await prisma.user.findUnique({
      where: { email }
    });

    // Do NOT reveal whether user exists (security)
    if (!user) {
      return res.status(200).json({
        success: true,
        message: "If the email exists, a reset code has been sent"
      });
    }

    const resetCode = generateVerificationCode();
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 min

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordCode: resetCode,
        resetPasswordExpiry: expiry
      }
    });

    // Try to send email
    await sendVerificationEmail(email, resetCode, user.name);

    return res.status(200).json({
      success: true,
      message: "Password reset code sent to email"
    });

  } catch (error) {
    console.error("Error in forgotPassword:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to process request"
    });
  }
};

const resetPassword = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { email, code, newPassword } = req.body;

    if (!email || !code || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Email, code and new password are required"
      });
    }

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user || !user.resetPasswordCode || !user.resetPasswordExpiry) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset request"
      });
    }

    if (user.resetPasswordCode !== code) {
      return res.status(400).json({
        success: false,
        message: "Invalid reset code"
      });
    }

    if (new Date() > user.resetPasswordExpiry) {
      return res.status(400).json({
        success: false,
        message: "Reset code expired"
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordCode: null,
        resetPasswordExpiry: null
      }
    });

    return res.status(200).json({
      success: true,
      message: "Password reset successful"
    });

  } catch (error) {
    console.error("Error in resetPassword:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to reset password"
    });
  }
};

const logoutUser = async (_req: Request, res: Response): Promise<Response> => {
  return res.status(200).json({
    success: true,
    message: "Logged out successfully"
  });
};

export {
  registerUser,
  verifyCode,
  resendCode,
  loginUser,
  forgotPassword,
  resetPassword,
  logoutUser
};