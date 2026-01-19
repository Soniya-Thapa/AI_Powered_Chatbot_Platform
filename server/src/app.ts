import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.route";
import chatRoutes from "./routes/chat.route";  
import messageRoutes from './routes/message.route';
import { envConfig } from "./env-config/config";

const app = express();

// Determine allowed origins based on env
const allowedOrigins = envConfig.nodeEnv === 'production' 
  ? [envConfig.clientUrlProd1, envConfig.clientUrlProd2] 
  : [envConfig.clientUrlDev];

// Enable CORS (MUST be before routes)
app.use(
  cors({
    origin: function(origin, callback){
      if (!origin) return callback(null, true); // allow Postman or server requests
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);
// To parse JSON bodies
app.use(express.json());

// Mount auth routes
app.use("/api/auth", authRoutes);
app.use("/api/chats", chatRoutes);  
app.use('/api/messages', messageRoutes);


export default app 

