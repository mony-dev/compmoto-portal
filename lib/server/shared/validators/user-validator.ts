// import { Prisma, User } from "@prisma/client";

// import prisma from "@lib-shared/tools/prisma/prisma";
// import { restErrorNotFound } from "@lib-shared/models/rest-error";

// export async function checkUserExist(phonePrefix: string, phoneNumber: string, employeeId: string, companyId: number) {
//   const user = await prisma.user.findFirst({
//     where: { phonePrefix, phoneNumber, employeeId: { equals: employeeId, mode: Prisma.QueryMode.insensitive }, companyId },
//   });
//   if (!user) {
//     throw restErrorNotFound("sign_in.user_not_found");
//   }
//   return user;
// }

// export function checkUserAssociateInCompany(companyId: number, user: User) {
//   if (companyId !== user.companyId) {
//     throw restErrorNotFound("sign_in.user_not_in_company");
//   }
//   return user;
// }
