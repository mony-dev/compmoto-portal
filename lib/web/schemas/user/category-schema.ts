import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().nonempty("Name is required!"),
  isActive: z.boolean().default(true),
});

export type CategorySchema = z.infer<typeof categorySchema>;
