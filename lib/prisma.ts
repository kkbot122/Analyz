// lib/prisma.ts
// 1. Update the import to point to your new generated location
import { PrismaClient } from '../prisma/generated/client'; 
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL;

const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined;
};

const createPrismaClient = () => {
  // 2. Configure the adapter
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);

  // 3. Pass the adapter to the constructor
  return new PrismaClient({
    adapter,
    log: ['query'],
  });
};

export const prisma = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;