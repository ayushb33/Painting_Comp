import { z } from 'zod';

export const studentSchema = z.object({
  full_name: z.string().min(2, 'Full name required'),
  class: z.string().min(1, 'Class required'),
  section: z.string().min(1, 'Section required'),
  father_name: z.string().min(2, 'Father name required'),
  admission_number: z.string().min(1, 'Admission number required'),
});

export const csvStudentSchema = z.object({
  full_name: z.string().min(2),
  class: z.string().min(1),
  section: z.string().min(1),
  father_name: z.string().min(2),
  admission_number: z.string().min(1),
});