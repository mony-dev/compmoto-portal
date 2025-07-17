import { useTranslation } from "react-i18next";
import { z } from "zod";

// Schema for TotalPurchaseItem
const totalPurchaseItemSchema = z.object({
  totalPurchaseAmount: z.number().min(0),
  cn: z.number().min(0),
  incentivePoint: z.number().min(0),
  loyaltyPoint: z.number().min(0),
});

// Schema for TotalPurchase
export const totalPurchaseSchema = (mode: "CREATE" | "EDIT") =>
  z.object({
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
    items: z
      .array(totalPurchaseItemSchema)
      .nonempty({ message: "At least one item is required" }), // Ensure at least one item is present
  });

export type TotalPurchaseSchema = z.infer<
  ReturnType<typeof totalPurchaseSchema>
>;
