// import { nativeEnum, object, string } from "zod";

// import { Prisma } from "@prisma/client";

// export function getBaseSortSchema<T>(items: (keyof T)[]) {
//   return object({
//     order: string()
//       .refine((item) => items.includes(item as keyof T))
//       .optional()
//       .transform((item) => item as keyof T),
//     orderBy: nativeEnum(Prisma.SortOrder).optional(),
//   }).refine((data) => {
//     if ((data.order !== undefined && data.orderBy === undefined) || (data.orderBy !== undefined && data.order === undefined)) {
//       return false;
//     }
//     return !(data.order && data.orderBy && (data.order === null || data.orderBy === null));
//   });
// }
