import { useTranslation } from 'react-i18next';
import { z } from 'zod';



// Schema for RewardPointSchema
export const rewardPointSchema = z.object({
  year: z.string().optional(),  // Customize the min year if needed
  month: z.string().optional(),
  expenses: z.number().nonnegative({ message: "Expenses is required!" }),
  point: z.number().nonnegative({ message: "Point is required!" }),
});

export type RewardPointSchema = z.infer<typeof rewardPointSchema>;
