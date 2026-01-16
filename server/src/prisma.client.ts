import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { envConfig } from './env-config/config';

//Create PostgreSQL pool FIRST
const pool = new Pool({
  connectionString: envConfig.databaseUrl,
});

//Handle graceful shutdown AFTER pool exists
// This safely closes DB connections when the server stops.
process.on("SIGINT", async () => {
  console.log("Shutting down database pool...");
  await pool.end();
  process.exit(0);
});

//Create Prisma adapter
const adapter = new PrismaPg(pool);

//Create Prisma client
const prisma = new PrismaClient({ adapter });

export default prisma;

// src/prisma.client.ts
// import { PrismaClient } from "@prisma/client";
// const prisma = new PrismaClient();
// export default prisma;
