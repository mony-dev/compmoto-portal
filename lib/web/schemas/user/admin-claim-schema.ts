import { z } from 'zod';
import { ImageClaimType } from "@prisma/client";
import { ImageClaimRole } from "@prisma/client";

const imageClaimSchema = z.object({
    url: z.string().url("Invalid URL"),
    type: z.nativeEnum(ImageClaimType),
    role: z.nativeEnum(ImageClaimRole),
  });

;
export const adminClaimSchema = z.object({
    status: z.string().nonempty("Status is required!"),
    statusMessage: z.string().nonempty("Details is required!"),
    imageClaims: z.array(imageClaimSchema).optional(),
});

export type AdminClaimSchema = z.infer<typeof adminClaimSchema>;
