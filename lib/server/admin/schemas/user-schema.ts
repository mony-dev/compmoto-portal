// import { PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH } from "@lib-shared/constants/configurations";
// import { Role, UserStatus } from "@prisma/client";
// import { array, nativeEnum, number, object, string, z } from "zod";

// import { localizedStringOptionalSchema } from "@lib-shared/schemas/base-schema";

// export const loginWithEmailPasswordBody = object({
//   email: string().trim().email(),
//   password: string().trim(),
// });

// export const createUserBody = object({
//   firstName: localizedStringOptionalSchema.optional().nullish(),
//   lastName: localizedStringOptionalSchema.optional().nullish(),
//   nickName: string().nullable().optional().default(null),
//   password: string().min(PASSWORD_MIN_LENGTH).max(PASSWORD_MAX_LENGTH).nullable().optional().default(null),
//   email: string().email().nullable().optional().default(null),
//   status: nativeEnum(UserStatus).optional().default(UserStatus.Active),
//   role: nativeEnum(Role).optional().default(Role.USER),
//   phonePrefix: string().nullable().optional().default(null),
//   phoneNumber: string().nullable().optional().default(null),
//   employeeId: string().nullable().optional().default(null),
//   companyId: number(),
//   departmentId: number().nullable().optional().default(null),
// });

// export const updateUserBody = object({
//   firstName: localizedStringOptionalSchema.optional().nullish(),
//   lastName: localizedStringOptionalSchema.optional().nullish(),
//   nickName: string().nullable().optional().nullish(),
//   password: string().min(PASSWORD_MIN_LENGTH).max(PASSWORD_MAX_LENGTH).nullable().optional().nullish(),
//   email: string().email().nullable().optional().nullish(),
//   status: nativeEnum(UserStatus).optional().nullish(),
//   role: nativeEnum(Role).optional().nullish(),
//   phonePrefix: string().nullable().optional().nullish(),
//   phoneNumber: string().nullable().optional().nullish(),
//   employeeId: string().nullable().optional().nullish(),
//   companyId: number().optional(),
//   departmentId: number().nullable().optional().nullish(),
// });

// export const importUserSchema = object({
//   employeeId: z.union([string().trim(), number()]).transform((item) => item.toString()),
//   phonePrefix: z.union([string().trim(), number()]).transform((item) => item.toString().replace("+", "")),
//   phoneNumber: z.union([string().trim(), number()]).transform((item) => item.toString()),
//   department: z
//     .union([string().trim(), number()])
//     .transform((item) => item.toString())
//     .nullable()
//     .optional()
//     .default(null),
// });

// export const previewImportUserSchema = object({
//   employeeId: z.union([string().trim(), number()]).transform((item) => item.toString()),
//   phonePrefix: z.union([string().trim(), number()]).transform((item) => item.toString().replace("+", "")),
//   phoneNumber: z.union([string().trim(), number()]).transform((item) => item.toString()),
//   department: z
//     .union([string().trim(), number()])
//     .transform((item) => item.toString())
//     .nullable()
//     .optional()
//     .default(null),
// });

// export const importUserSchemas = array(importUserSchema.strip()).min(1);
// export const previewImportUserSchemas = array(previewImportUserSchema.strip()).min(1);

// export type LoginWithEmailPasswordBody = z.infer<typeof loginWithEmailPasswordBody>;
// export type CreateUserBody = z.infer<typeof createUserBody>;
// export type UpdateUserBody = z.infer<typeof updateUserBody>;
// export type ImportUserSchema = z.infer<typeof importUserSchema>;
// export type PreviewImportUserSchema = z.infer<typeof previewImportUserSchema>;
