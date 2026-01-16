import app from "./src/app";
import { envConfig } from "./src/env-config/config";
import prisma from "./src/prisma.client";

async function startServer(){
  try {
    await prisma.$connect();
    console.log("Database connection has been established successfully.");
    
    const port = envConfig.portNumber;
    app.listen(port, function(){
      console.log(`Hurray! Backend running with TypeScript...`);
      console.log(`Server has started at port ${port}`);
    });
  } catch (error) {
    console.error("Unable to start server:", error);
    process.exit(1);
  }
}

startServer();
