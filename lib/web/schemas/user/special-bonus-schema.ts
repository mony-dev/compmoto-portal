import { z } from 'zod';

// Schema for SpecialBonusItem
const specialBonusItemSchema = z.object({
  totalPurchaseAmount: z.number().min(0, { message: "Must be greater than 0" }),
  cn: z.number().min(0),
  incentivePoint: z.number().min(0),
});

// Schema for each Brand's SpecialBonus
const brandSpecialBonusSchema = z.object({
  minisizeId: z.number().nullable(),
  color: z.string().optional(),
  items: z.array(specialBonusItemSchema).nonempty({ message: "At least one item is required" }),
});

// Main SpecialBonus Schema
export const specialBonusSchema = (mode: "CREATE" | "EDIT") => z.object({
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
  isActive: z.boolean().optional(), // Optional as it defaults to true on save
  customerGroupId: z.number().nullable(),
  brands: z.array(brandSpecialBonusSchema).nonempty({ message: "At least one brand is required" }), // Multiple brands
});

export type SpecialBonusSchema = z.infer<
  ReturnType<typeof specialBonusSchema>
>;