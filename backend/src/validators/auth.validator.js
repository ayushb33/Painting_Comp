import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['ADMIN', 'TEACHER', 'JUDGE'], { errorMap: () => ({ message: 'Invalid role' }) }),
});

export const createSchoolSchema = z.object({
  school_name: z.string().min(3, 'School name too short'),
  teacher_name: z.string().min(2, 'Teacher name too short'),
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  contact_number: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
});

export const createJudgeSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
});