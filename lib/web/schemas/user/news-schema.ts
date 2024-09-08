import { z } from "zod";


export const newsSchema = z.object({
  minisizeId: z.number().nonnegative({ message: "Minisize is required!" }),
  name: z.string().nonempty("Name is required!"),
  isActive: z.boolean().default(true),
  coverImg: z.string().nonempty("Please upload file"),
  content: z.string().nonempty("Content is required!"),
});

export type NewsSchema = z.infer<typeof newsSchema>;
