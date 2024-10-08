import { z } from "zod";

export const createBlogInput = z.object({
  title: z.string(),
  content: z.string(),
  thumbnail: z.string().optional(),
  published: z.boolean().optional(),
});

export const updateBlogInput = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
  thumbnail: z.string().optional(),
  published: z.boolean().optional(),
});

export type CreateBlogInput = z.infer<typeof createBlogInput>;
export type UpdateBlogInput = z.infer<typeof updateBlogInput>;
