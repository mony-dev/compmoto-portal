// import { PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH } from "@lib-shared/constants/configurations";
// import { number, object, string, z } from "zod";

// // import { transformToNumberOptionalSchema } from "@lib-shared/schemas/base-schema";

// export const createAdminBody = object({
//   email: string().email(),
//   password: string().min(PASSWORD_MIN_LENGTH).max(PASSWORD_MAX_LENGTH),
//   companyId: number(),
// });

// export const updateAdminBody = object({
//   email: string().email().nullable().optional().nullish(),
//   password: string().min(PASSWORD_MIN_LENGTH).max(PASSWORD_MAX_LENGTH).nullable().optional().nullish(),
// });

// export const adminResetPasswordBody = object({
//   email: string().email(),
// });

// export const adminSetPasswordBody = object({
//   password: string().min(PASSWORD_MIN_LENGTH).max(PASSWORD_MAX_LENGTH),
//   token: string(),
// });

// // export const adminsInPublicProfileIdBody = object({
// //   publicProfileId: transformToNumberOptionalSchema,
// // });

// export type CreateAdminBody = z.infer<typeof createAdminBody>;
// export type UpdateAdminBody = z.infer<typeof updateAdminBody>;
// export type AdminResetPasswordBody = z.infer<typeof adminResetPasswordBody>;
// export type AdminSetPasswordBody = z.infer<typeof adminSetPasswordBody>;
// // export type AdminsInPublicProfileIdBody = z.infer<typeof adminsInPublicProfileIdBody>;
