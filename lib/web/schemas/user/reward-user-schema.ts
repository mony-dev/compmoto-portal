import { z } from "zod";

export const rewardUserSchema = z.object({
  isComplete: z.boolean().default(false),
});

export type RewardUserSchema = z.infer<typeof rewardUserSchema>;
