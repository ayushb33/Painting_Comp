import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create default admin
  const adminHash = await bcrypt.hash('Admin@123', 12);
  await prisma.admin.upsert({
    where: { email: 'admin@npc.gov.in' },
    update: {},
    create: { name: 'Super Admin', email: 'admin@npc.gov.in', password_hash: adminHash }
  });

  // Create sample judge
  const judgeHash = await bcrypt.hash('Judge@123', 12);
  await prisma.judge.upsert({
    where: { email: 'judge1@npc.gov.in' },
    update: {},
    create: { name: 'Judge One', email: 'judge1@npc.gov.in', password_hash: judgeHash }
  });

  console.log('✅ Seed complete');
  console.log('Admin: admin@npc.gov.in / Admin@123');
  console.log('Judge: judge1@npc.gov.in / Judge@123');
}

main().catch(console.error).finally(() => prisma.$disconnect());