import { z } from "zod";

const levelSchemaLv1 = z.object({
  name: z.string().nonempty({ message: "Name is required" }),
  isActive: z.boolean(),
  data: z.string().nonempty({ message: "Data is required" }),
});

const levelSchema = z.object({
    name: z.string().optional(),
    isActive: z.boolean(),
    data: z.string().optional(),
  }).refine(data => {
    if (data.isActive && !data.name) {
      return false;
    }
    if (data.isActive && !data.data) {
      return false;
    }
    return true;
  }, {
    message: "Name is required",
    path: ["name"],
  }).refine(data => {
    if (data.isActive && !data.data) {
      return false;
    }
    return true;
  }, {
    message: "Data is required",
    path: ["data"],
  });

const atLeastOneActiveLv1 = z
  .array(levelSchemaLv1)
  .refine((levels) => levels.some(level => level.isActive), {
    message: "At least one lv1 entry must be active",
  });

export const minisizeSchema = z.object({
  brandIds: z.array(z.number().nonnegative()).min(1, { message: "At least one brand is required!" }),
  name: z.string().nonempty("Name is required!"),
  isActive: z.boolean().default(true),
  lv1: atLeastOneActiveLv1,
  lv2: z.array(levelSchema),
  lv3: z.array(levelSchema),
  imageProfile: z.string().nonempty("Please upload file"),
  mediaBanner: z.string().optional(),
  newsBanner: z.string().optional(),
});

export type MinisizeSchema = z.infer<typeof minisizeSchema>;
