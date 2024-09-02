import { z } from "zod";


export const mediaSchema = z.object({
  minisizeId: z.number().nonnegative({ message: "Minisize is required!" }),
  name: z.string().nonempty("Name is required!"),
  isActive: z.boolean().default(true),
  url: z.string().nonempty("Please upload file"),
  type: z.string().nonempty("Type is required!"),
  coverImg: z.string().optional()
});

export type MediaSchema = z.infer<typeof mediaSchema>;
