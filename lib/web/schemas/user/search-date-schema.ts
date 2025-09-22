import { z } from "zod";

export const searchDateSchema = z.object({
  year: z.string().optional(),
  month: z.string().optional(),
});

export type SearchDateSchema = z.infer<typeof searchDateSchema>;
