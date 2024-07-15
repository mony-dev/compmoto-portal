import { z } from 'zod';
const RoleEnum = z.enum(["USER", "ADMIN", "SUPER_ADMIN", "CLAIM", "SALE"]);


export const adminSchema = z.object({
  email: z.string().email("Please input a valid email!").nonempty("Email is required!"),
  name: z.string().nonempty("Name is required!"),
  role: RoleEnum,
  custNo: z.string(),
  newPassword: z.string().min(6, "Password must be at least 6 characters long!").nonempty("Password is required!"),
  confirmPassword: z.string().min(6, "Password must be at least 6 characters long!").nonempty("Confirm password is required!")
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});

export type AdminSchema = z.infer<typeof adminSchema>;
