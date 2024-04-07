import { z } from "zod";

export const signInSchema = z
  .object({
    email: z.string().min(1, { message: "Email is required" }).email({
      message: "Must be a valid email",
    }),
    password: z.string().min(6, { message: "Password must be atleast 6 characters" }),
  })
  .partial();

export type SignInSchema = z.infer<typeof signInSchema>;
