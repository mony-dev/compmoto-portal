// import { AdminRole, AdminStatus, Prisma } from "@prisma/client";
// import { AdminSearchParams, AdminSortParams } from "@lib-admin/param-schemas/admin-params-schema";
// import { CreateAdminBody, UpdateAdminBody } from "@lib-admin/schemas/admin-schema";
// import { InternalIdPrefix, generateInternalId } from "@lib-shared/utils/internal-id-generators";

// import { CollectionParams } from "@lib-shared/params/collection-params";
// import { DateTime } from "luxon";
// import { hashPassword } from "@lib-shared/utils/password-helper";

// export type AdminCollectionParams = CollectionParams & { searchParams: AdminSearchParams; sortParams: AdminSortParams };

// export const adminSortAbleFields: (keyof Prisma.AdminOrderByWithRelationInput)[] = ["createdAt", "updatedAt", "id"];
// export const adminFreeTextSearchFields: (keyof Prisma.AdminWhereInput)[] = ["email"];

// export function getAdminDataCollectionParams({ q, pagination, searchParams, sortParams }: AdminCollectionParams): Prisma.AdminFindManyArgs {
//   const mode = Prisma.QueryMode.insensitive;
//   // Free text search
//   const freeTextSearches: Prisma.Enumerable<Prisma.AdminWhereInput> = [];
//   if (q) {
//     adminFreeTextSearchFields.forEach((field) => {
//       const s: Prisma.AdminWhereInput = {
//         [field]: { contains: q, mode },
//       };
//       freeTextSearches.push(s);
//     });
//   }
//   const or: Prisma.AdminWhereInput = {};
//   if (freeTextSearches.length > 0 && q) {
//     or.OR = freeTextSearches;
//   }
//   // Specific search
//   const specificSearches: Prisma.AdminWhereInput = {
//     email: { contains: searchParams.email, mode },
//   };
//   // Combine search
//   const where: Prisma.AdminWhereInput = {};
//   where.AND = [or, specificSearches];

//   // Sort
//   let orderBy: Prisma.AdminOrderByWithRelationInput = {};
//   if (sortParams.order) {
//     orderBy[sortParams.order] = sortParams.orderBy;
//   }
//   const data: Prisma.AdminFindManyArgs = {
//     where,
//     take: pagination.pageSize,
//     skip: pagination.pageSize * (pagination.page - 1),
//     orderBy,
//   };

//   return data;
// }

// export async function createAdminInput(
//   params: CreateAdminBody
// ): Promise<Prisma.XOR<Prisma.AdminCreateInput, Prisma.AdminUncheckedCreateInput>> {
//   return {
//     email: params.email,
//     encryptedPassword: await hashPassword(params.password),
//     role: AdminRole.Admin,
//   };
// }

// export async function updateAdminInput(
//   params: UpdateAdminBody
// ): Promise<Prisma.XOR<Prisma.AdminUpdateInput, Prisma.AdminUncheckedUpdateInput>> {
//   return {
//     email: params.email ? params.email : undefined,
//     encryptedPassword: params.password ? await hashPassword(params.password) : undefined,
//   };
// }

// export function softDeleteAdminInput(): Prisma.XOR<Prisma.AdminUpdateInput, Prisma.AdminUncheckedUpdateInput> {
//   const now = DateTime.now();
//   return {
//     email: `deleted-${now.toUnixInteger()}`,
//     encryptedPassword: "",
//     deletedAt: now.toJSDate(),
//     firstName: {},
//     lastName: {},
//     status: AdminStatus.Inactive,
//     title: {},
//   };
// }
