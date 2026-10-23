import { z } from 'zod';
export const loginSchema = z.object({ body: z.object({ email: z.string().email().transform((v) => v.toLowerCase()), password: z.string().min(1).max(128) }), params: z.object({}), query: z.object({}) });
