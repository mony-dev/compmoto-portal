import { MediaType } from "@prisma/client";
import { z } from "zod";


export const mediaSchema = z.object({
  minisizeId: z.number().nonnegative({ message: "Minisize is required!" }),
  name: z.string().nonempty("Name is required!"),
  isActive: z.boolean().default(true),
  url: z.string().optional() ,
  type: z.nativeEnum(MediaType),
  coverImg: z.string().nonempty("Please upload file"),
});

export type MediaSchema = z.infer<typeof mediaSchema>;
