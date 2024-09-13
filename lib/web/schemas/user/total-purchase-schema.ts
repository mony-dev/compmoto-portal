import { useTranslation } from 'react-i18next';
import { z } from 'zod';

// Schema for TotalPurchaseItem
const totalPurchaseItemSchema = z.object({
  totalPurchaseAmount: z.number().min(0),
  cn: z.number().min(0),
  incentivePoint: z.number().min(0),
  loyaltyPoint: z.number().min(0),
});

// Schema for TotalPurchase
export const totalPurchaseSchema = z.object({
  year: z.string().nonempty({ message: "Year is required" }),  // Customize the min year if needed
  month: z.string().nonempty({ message: "Month is required" }),
  resetDate: z.string().nonempty("Please select reset date"),
  isActive: z.boolean().optional(),  // Optional as it defaults to true on save
  items: z.array(totalPurchaseItemSchema).nonempty({ message: "At least one item is required" }),  // Ensure at least one item is present
});

export type TotalPurchaseSchema = z.infer<typeof totalPurchaseSchema>;
