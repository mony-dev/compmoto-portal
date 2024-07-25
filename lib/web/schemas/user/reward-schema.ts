import { z } from "zod";

export const rewardSchema = z.object({
  name: z.string().nonempty("Please enter reward name"),
  startDate: z.string().nonempty("Please select reward start date"),
  endDate: z.string().nonempty("Please select reward end date"),
  point: z.number({
    required_error: "Please enter reward point",
    invalid_type_error: "Point must be a number",
  }),
  file: z.string().nonempty("Please upload image"),
  image: z.string().nonempty("Please upload file"),
});

export type RewardSchema = z.infer<typeof rewardSchema>;
