import { z } from "zod";

export const rewardUserSchema = z.object({
  custNo: z.string().nullable().optional(),
});

export type RewardUserSchema = z.infer<typeof rewardUserSchema>;
