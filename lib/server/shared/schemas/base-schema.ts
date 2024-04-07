import { nativeEnum, number, object, string, z } from "zod";

// import { FileAction } from "@lib-admin/controllers/file-controller";
// import { RestError } from "@lib-shared/models/rest-error";
import { isURL } from "@lib-shared/utils/url-helper";

export const localizedStringRequiredSchema = object({
  en: string().trim(),
  th: string().trim(),
  my: string().trim(),
});

export const localizedStringOptionalSchema = object({
  en: string().trim().optional().default(""),
  th: string().trim().optional().default(""),
});

// export const fileOptionalSchema = object({
//   id: number().optional(),
//   fileName: string().nullable().optional(),
//   contentType: string(),
//   action: nativeEnum(FileAction).optional(),
// })
//   .optional()
//   .nullable()
//   .transform((item) => {
//     if (item?.action == FileAction.Delete) {
//       return item;
//     }
//     return isURL(item?.fileName) ? undefined : item;
//   });

// export const idQuery = z.union([string(), number()]).transform((item) => {
//   if (typeof item == "string" && Number.isNaN(Number(item))) {
//     throw RestError.notFound;
//   }
//   return Number(item);
// });

// export const transformToNumberOptionalSchema = z
//   .union([string(), number()])
//   .optional()
//   .transform((item) => (Number.isNaN(Number(item)) ? undefined : Number(item)));

// export const imageSchema = string()
//   .optional()
//   .nullable()
//   .transform((item) => {
//     if (item === null) return null;
//     return isURL(item) ? undefined : item;
//   });

// export type FileBody = z.infer<typeof fileOptionalSchema>;
