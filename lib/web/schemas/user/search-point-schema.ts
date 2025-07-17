import { z } from "zod";

export const searchPointSchema = z.object({
  year: z.string().optional(),
  month: z.string().optional(),
  usedPoint: z.string().optional(),
});

export type SearchPointSchema = z.infer<typeof searchPointSchema>;
