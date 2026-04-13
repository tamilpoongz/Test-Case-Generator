import { z } from 'zod';

export const storyFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'User Story Title is required')
    .min(5, 'User Story Title must be at least 5 characters')
    .max(200, 'User Story Title must not exceed 200 characters'),
  description: z
    .string()
    .trim()
    .min(1, 'Description is required')
    .min(20, 'Description must be at least 20 characters')
    .max(2000, 'Description must not exceed 2000 characters'),
  acceptanceCriteria: z
    .string()
    .trim()
    .min(1, 'Acceptance Criteria is required')
    .min(5, 'Acceptance Criteria must have meaningful content'),
});

export type StoryFormData = z.infer<typeof storyFormSchema>;
