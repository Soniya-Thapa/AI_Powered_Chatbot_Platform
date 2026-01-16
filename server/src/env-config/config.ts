import { config } from "dotenv" //config is function given by dotenv
config()

export const envConfig = {
  portNumber: process.env.PORT || 5000,

  databaseUrl: process.env.DATABASE_URL,

  jwtSecretKey: process.env.JWT_SECRET,

  //email config
  emailHost: process.env.EMAIL_HOST,
  emailPort: process.env.EMAIL_PORT,
  emailUser: process.env.EMAIL_USER,
  appPass: process.env.EMAIL_PASSWORD,
  emailFrom: process.env.EMAIL_FROM,
  appName: process.env.APP_NAME,
  appUrl: process.env.APP_URL,

  //gemini
  geminiApiKey: process.env.GEMINI_API_KEY,
  geminiModel: process.env.GEMINI_MODEL

}
