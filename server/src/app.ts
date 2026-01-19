import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.route";
import chatRoutes from "./routes/chat.route";  
import messageRoutes from './routes/message.route';

const app = express();

// Enable CORS (MUST be before routes)
app.use(
  cors({
    origin: "http://localhost:3000", // Next.js frontend
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

