import { Resend } from 'resend';
import { envConfig } from '../env-config/config';

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// Verify Resend is configured
if (!process.env.RESEND_API_KEY) {
  console.error('⚠️ RESEND_API_KEY not found in environment variables');
  console.log('📧 Emails will be logged to console instead');
} else {
  console.log('✅ Email service (Resend) is ready');
}

// Send verification code email
export const sendVerificationEmail = async (
  email: string,
  verificationCode: string,
  userName?: string
) => {
  try {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
          }
          .content {
            background: #f9f9f9;
            padding: 30px;
            border-radius: 0 0 10px 10px;
          }
          .code-box {
            background: white;
            border: 2px dashed #667eea;
            padding: 20px;
            text-align: center;
            margin: 20px 0;
            border-radius: 8px;
          }
          .code {
            font-size: 32px;
            font-weight: bold;
            color: #667eea;
            letter-spacing: 8px;
            font-family: 'Courier New', monospace;
          }
          .footer {
            text-align: center;
            margin-top: 20px;
            color: #666;
            font-size: 12px;
          }
          .warning {
            background: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 12px;
            margin: 20px 0;
            border-radius: 4px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🤖 ${envConfig.appName || 'AI Chatbot'}</h1>
          <p>Email Verification</p>
        </div>
        
        <div class="content">
          <h2>Hello ${userName || 'there'}! 👋</h2>
          <p>Thank you for registering with ${envConfig.appName || 'our platform'}.</p>
          <p>Your verification code is:</p>
          
          <div class="code-box">
            <div class="code">${verificationCode}</div>
          </div>
          
          <p>Enter this code to verify your email address and complete your registration.</p>
          
          <div class="warning">
            ⚠️ <strong>Important:</strong> This code will expire in <strong>10 minutes</strong>.
          </div>
          
          <p>If you didn't request this code, please ignore this email.</p>
          
          <div class="footer">
            <p>This is an automated email. Please do not reply.</p>
            <p>© ${new Date().getFullYear()} ${envConfig.appName || 'AI Chatbot Platform'}. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const textContent = `
Hello ${userName || 'there'}!

Your verification code is: ${verificationCode}

This code will expire in 10 minutes.

If you didn't request this code, please ignore this email.

© ${new Date().getFullYear()} ${envConfig.appName || 'AI Chatbot Platform'}
    `.trim();

    const { data, error } = await resend.emails.send({
      from: envConfig.emailFrom || 'AI Chatbot <onboarding@resend.dev>',
      to: email,
      subject: `${verificationCode} is your verification code`,
      html: htmlContent,
      text: textContent,
    });

    if (error) {
      throw new Error(error.message);
    }

    console.log('✅ Verification email sent successfully:', data?.id);
    return { success: true, messageId: data?.id };
  } catch (error: any) {
    console.error('❌ Error sending verification email:', error.message);
    // Log the code for manual verification
    console.log(`📧 VERIFICATION CODE for ${email}: ${verificationCode}`);
    console.log('⚠️ Email failed but code is stored in database');
    // Don't throw - return error info instead
    return { success: false, error: error.message };
  }
};

// Send welcome email (after verification)
export const sendWelcomeEmail = async (
  email: string,
  userName: string
) => {
  try {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
          }
          .content {
            background: #f9f9f9;
            padding: 30px;
            border-radius: 0 0 10px 10px;
          }
          .button {
            display: inline-block;
            background: #667eea;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🎉 Welcome!</h1>
        </div>
        
        <div class="content">
          <h2>Hello ${userName}! 👋</h2>
          <p>Your email has been verified successfully!</p>
          <p>You can now start using ${envConfig.appName} to have intelligent conversations with AI.</p>
          
          <center>
            <a href="${envConfig.appUrl}" class="button">Start Chatting Now</a>
          </center>
          
          <p>If you have any questions, feel free to reach out to our support team.</p>
          
          <p>Happy chatting! 🤖</p>
        </div>
      </body>
      </html>
    `;

    const { data, error } = await resend.emails.send({
      from: envConfig.emailFrom || 'AI Chatbot <onboarding@resend.dev>',
      to: email,
      subject: `Welcome to ${envConfig.appName}! 🎉`,
      html: htmlContent,
    });

    if (error) {
      throw new Error(error.message);
    }

    console.log('✅ Welcome email sent:', data?.id);
    return { success: true };
  } catch (error: any) {
    console.error('⚠️ Error sending welcome email:', error.message);
    // Don't throw error - welcome email is not critical
    return { success: false };
  }
};

export default resend;