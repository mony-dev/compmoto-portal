import { z } from "zod";

export const signInSchema = z
  .object({
    custNo: z.string().nonempty("custNo is required!"),
    password: z.string().min(6, { message: "Password must be atleast 6 characters" }),
  })
  .partial();

export type SignInSchema = z.infer<typeof signInSchema>;
