import { z } from "zod";

export const signupInput = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(3).optional(),
});

export const signInInput = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export type SignupInput = z.infer<typeof signupInput>;
export type SignInInput = z.infer<typeof signInInput>;
