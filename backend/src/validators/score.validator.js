import { z } from 'zod';

const scoreField = z.number().int().min(1).max(5);

export const scoreSchema = z.object({
  painting_id: z.number().int().positive(),
  relevance_score: scoreField,
  creativity_score: scoreField,
  technique_score: scoreField,
  presentation_score: scoreField,
});