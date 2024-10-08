import { z } from 'zod';


export const userSchema = z.object({
  email: z.string().email("Please input a valid email!").nonempty("Email is required!"),
  name: z.string().nonempty("Name is required!"),
  phoneNumber: z.string().nullable().optional(),
  saleUserId: z.number().nullable().optional(),
  rewardPoint: z.number().nullable().optional(),
  minisizeIds: z.array(z.number()).optional()
});

export type UserSchema = z.infer<typeof userSchema>;
