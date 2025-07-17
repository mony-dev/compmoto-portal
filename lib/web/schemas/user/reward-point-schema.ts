// import { useTranslation } from 'react-i18next';
// import { z } from 'zod';



// // Schema for RewardPointSchema
// export const rewardPointSchema = z.object({
//   year: z.string().optional(),  // Customize the min year if needed
//   month: z.string().optional(),
//   expenses: z.number().nonnegative({ message: "Expenses is required!" }),
//   point: z.number().nonnegative({ message: "Point is required!" }),
// });

// export type RewardPointSchema = z.infer<typeof rewardPointSchema>;

import { useTranslation } from 'react-i18next';
import { z } from 'zod';



// Schema for RewardPointSchema
export const rewardPointSchema = (mode: "CREATE" | "EDIT") => z.object({
  name: z.string().nonempty({ message: "Year is required" }),
  year:
    mode === "CREATE"
      ? z.string().nonempty({ message: "Year is required" })
      : z.string().optional(),
  month:
      mode === "CREATE"
        ? z.string().nonempty({ message: "Month is required" })
        : z.string().optional(),
  resetDate:
    mode === "CREATE"
      ? z.string().nonempty("Please select reset date")
      : z.string().optional(),
  expenses:
    mode === "CREATE"
      ? z.number().nonnegative({ message: "Expenses is required!" })
      : z.number().optional(),
  point:
      mode === "CREATE"
        ? z.number().nonnegative({ message: "Point is required!" })
        : z.number().optional(),
  isFinalize: z.boolean().optional(),
  customerGroupId: z.number().nullable(),
  totalPurchaseId: z.number().nullable(),
  specialBonusId: z.number().nullable(),
  totalPurchaseName: z.string().optional(),
  specialBonusName: z.string().optional(),
});

export type RewardPointSchema = z.infer<
  ReturnType<typeof rewardPointSchema>
>;