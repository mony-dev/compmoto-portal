import { z } from "zod";

export const albumSchema = z.object({
  name: z.string().nonempty("Please enter album name"),
  image: z.string().nullable().optional()
});

export type AlbumSchema = z.infer<typeof albumSchema>;
