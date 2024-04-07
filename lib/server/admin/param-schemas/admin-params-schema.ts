// import { AdminCollectionParams, adminSortAbleFields } from "@lib-admin/params/admin-params";
// import { object, string, z } from "zod";

// import { Prisma } from "@prisma/client";
// import { getBaseSortSchema } from "../../shared/param-schemas/base-param-schema";
// import { getCollectionParamsV2 } from "@lib-shared/params/collection-params";
// // import { transformToNumberOptionalSchema } from "@lib-shared/schemas/base-schema";

// export const adminSortParamsSchema = getBaseSortSchema<Prisma.AdminOrderByWithRelationInput>(adminSortAbleFields);

// export const adminSearchParamsSchema = object({
//   email: string().optional(),
// });

// export type AdminSearchParams = z.infer<typeof adminSearchParamsSchema>;
// export type AdminSortParams = z.infer<typeof adminSortParamsSchema>;

// export function getAdminParams(query: { [key: string]: string }): AdminCollectionParams {
//   const collectionParams = getCollectionParamsV2(query);
//   const searchParams = adminSearchParamsSchema.strip().parse(query);
//   const sortParams = adminSortParamsSchema.parse(query);

//   return { ...collectionParams, searchParams, sortParams };
// }
