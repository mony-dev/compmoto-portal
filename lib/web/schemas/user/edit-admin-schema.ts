import { z } from 'zod';
const RoleEnum = z.enum(["USER", "ADMIN", "SUPER_ADMIN", "CLAIM", "SALE"]).nullable().optional();


export const editAdminSchema = z.object({
  email: z.string().email("Please input a valid email!").nonempty("Email is required!"),
  name: z.string().nonempty("Name is required!"),
  role: RoleEnum,
  phoneNumber: z.string().nullable().optional(),
  custNo: z.string().nonempty("Name is required!"),
});

export type EditAdminSchema = z.infer<typeof editAdminSchema>;
