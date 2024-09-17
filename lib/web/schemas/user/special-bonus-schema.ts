import { z } from 'zod';

// Schema for SpecialBonusItem
const specialBonusItemSchema = z.object({
  totalPurchaseAmount: z.number().min(0, { message: "Must be greater than 0" }),
  cn: z.number().min(0),
  incentivePoint: z.number().min(0),
});

// Schema for each Brand's SpecialBonus
const brandSpecialBonusSchema = z.object({
  brandId: z.number().nullable(),
  color: z.string().optional(),
  items: z.array(specialBonusItemSchema).nonempty({ message: "At least one item is required" }),
});

// Main SpecialBonus Schema
export const specialBonusSchema = z.object({
  year: z.string().nonempty({ message: "Year is required" }),
  month: z.string().nonempty({ message: "Month is required" }),
  resetDate: z.string().nonempty("Please select reset date"),
  isActive: z.boolean().optional(),
  brands: z.array(brandSpecialBonusSchema).nonempty({ message: "At least one brand is required" }), // Multiple brands
});

export type SpecialBonusSchema = z.infer<typeof specialBonusSchema>;