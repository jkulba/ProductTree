import { defineCollection, z } from 'astro:content';

const docs = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    app: z.string(),
    category: z.enum(['development', 'automation', 'support']),
    order: z.number().optional(),
    lastUpdated: z.date().optional(),
    tags: z.array(z.string()).optional(),
  }),
});

export const collections = {
  docs,
};