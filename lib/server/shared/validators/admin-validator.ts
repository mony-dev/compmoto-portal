// import { Admin, AdminStatus, VerificationToken } from "@prisma/client";
// import { restErrorNotFound, restErrorUnauthorized } from "@lib-shared/models/rest-error";

// import prisma from "@lib-shared/tools/prisma/prisma";

// export function validateAdmin(admin: Admin) {
//   if (admin.status === AdminStatus.Inactive) {
//     throw restErrorUnauthorized("user_validator.inactivated");
//   }
//   return admin;
// }

// export async function checkAdminAssociateInCompany(companyId: number, id: number) {
//   const admin = await prisma.admin.findFirst({ where: { companyId, id } });
//   if (!admin) {
//     throw restErrorNotFound("admin.not_associate_with_compay");
//   }
//   return admin;
// }

// export async function validateTokenExpiredAt(verificationToken: VerificationToken | null) {
//   if (!verificationToken) {
//     throw restErrorNotFound("admin.validators.token_not_found");
//   }

//   if (verificationToken?.expiredAt < new Date()) {
//     await prisma.verificationToken.delete({ where: { id: verificationToken.id } });
//     throw restErrorNotFound("admin.validators.verification_code_expired");
//   }
//   return verificationToken;
// }
