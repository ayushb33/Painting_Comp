import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const generateUniqueStudentId = async (schoolId) => {
  // Format: NPC-SCHOOLID-TIMESTAMP-RANDOM
  const school = await prisma.school.findUnique({ where: { id: schoolId } });
  const prefix = school.school_name
    .split(' ')
    .map(w => w[0].toUpperCase())
    .join('')
    .slice(0, 3);
  
  const timestamp = Date.now().toString().slice(-5);
  const random = Math.floor(Math.random() * 900 + 100);
  return `NPC-${prefix}${schoolId}-${timestamp}${random}`;
};