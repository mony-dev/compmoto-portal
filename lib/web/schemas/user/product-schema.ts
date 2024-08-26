import { z } from "zod";

export const imageProductSchema = z.object({
  url: z.string().url("Invalid URL"),
});

export const yearSchema = z.object({
  year: z.string().nullable().optional(),
  discount: z.number().nullable().optional(),
  isActive: z.boolean(),
  isDisable: z.boolean()

});

export const productSchema = z.object({
  portalStock: z.number({
    required_error: "Please enter portal stock",
    invalid_type_error: "Portal stock must be a number",
  }),
  promotionId: z.number().nullable().optional(),
  years: z.array(yearSchema).optional(),
  imageProducts: z.array(imageProductSchema).optional(),
  lv1Id: z.number().nullable().optional(),
  lv2Id: z.number().nullable().optional(),
  lv3Id: z.number().nullable().optional(),

});

export type ProductSchema = z.infer<typeof productSchema>;
