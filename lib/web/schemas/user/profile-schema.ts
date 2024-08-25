import { z } from "zod";

export const profileSchema = z.object({
  image: z.string().nonempty("Name is required!"),
});

export type ProfileSchema = z.infer<typeof profileSchema>;
