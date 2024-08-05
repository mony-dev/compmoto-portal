import { z } from "zod";

export const productSchema = z.object({
  name: z.string().nonempty("Name is required!"),
});

export type ProductSchema = z.infer<typeof productSchema>;
