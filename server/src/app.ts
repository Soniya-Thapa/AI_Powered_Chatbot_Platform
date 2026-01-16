import express, { Request, Response } from "express";

import authRoutes from "./routes/auth.route";
import chatRoutes from "./routes/chat.route";  
import messageRoutes from './routes/message.route';

const app = express();

// To parse JSON bodies
app.use(express.json());

// Mount auth routes
app.use("/api/auth", authRoutes);
app.use("/api/chats", chatRoutes);  
app.use('/api/messages', messageRoutes);


export default app 

