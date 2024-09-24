import { z } from "zod";


export const manualSchema = z.object({
  name: z.string().nonempty("Name is required!"),
  content: z.string().nonempty("Content is required!"),
});

export type ManualSchema = z.infer<typeof manualSchema>;
