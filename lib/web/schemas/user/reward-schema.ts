import { z } from "zod";

export const rewardSchema = z.object({
  name: z.string().nonempty("Name is required!"),
  startDate: z.string().datetime().nullable().optional(),
  endDate: z.string().datetime().nullable().optional(),
  point: z.number().nullable().optional(),
  file: z.string().nullable().optional(),
  image: z.string().nullable().optional(),
});

export type RewardSchema = z.infer<typeof rewardSchema>;
