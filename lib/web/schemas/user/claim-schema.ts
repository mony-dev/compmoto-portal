import { z } from 'zod';
import { ConditionType } from "@prisma/client";
import { ImageClaimType } from "@prisma/client";
import { ImageClaimRole } from "@prisma/client";

const imageClaimSchema = z.object({
    url: z.string().url("Invalid URL"),
    type: z.nativeEnum(ImageClaimType),
    role: z.nativeEnum(ImageClaimRole),
  });

;
export const claimSchema = z.object({
    productId: z.number().nonnegative({ message: "Product is required!" }),
    condition: z.nativeEnum(ConditionType).optional(),
    details: z.string().nonempty("Details is required!"),
    imageClaims: z.array(imageClaimSchema).optional(),
    isAccept: z.boolean().default(true),
});

export type ClaimSchema = z.infer<typeof claimSchema>;
