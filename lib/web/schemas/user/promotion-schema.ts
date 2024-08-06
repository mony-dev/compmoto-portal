import { z } from "zod";
export const promotionSchema = z.object({
  minisizeId: z.number().nonnegative({ message: "Minisize is required!" }),
  name: z.string().nonempty("Name is required!"),
  isActive: z.boolean().default(true),
  amount: z.number().nonnegative({ message: "Amount is required!" }),
  productRedeem: z.string().nonempty("Product redeem is required!"),
  userGroup: z.string().nonempty("User group redeem is required!"),
  startDate: z.string().nonempty("Please select reward start date"),
  endDate: z.string().nonempty("Please select reward end date"),
  image: z.string().nonempty("Please upload file"),
});

export type PromotionSchema = z.infer<typeof promotionSchema>;
