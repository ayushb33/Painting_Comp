import 'dotenv/config';
import app from './src/app.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

async function main() {
  await prisma.$connect();
  console.log('✅ Database connected');
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
}

main().catch((e) => {
  console.error('❌ Server failed to start:', e);
  process.exit(1);
});

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});