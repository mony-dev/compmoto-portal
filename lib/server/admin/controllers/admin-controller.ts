// import {
//   AdminCollectionParams,
//   createAdminInput,
//   getAdminDataCollectionParams,
//   softDeleteAdminInput,
//   updateAdminInput,
// } from "@lib-admin/params/admin-params";
// import {
//   AdminResetPasswordBody,
//   AdminSetPasswordBody,
//   CreateAdminBody,
//   UpdateAdminBody,
// } from "@lib-admin/schemas/admin-schema";
// import { Prisma, VerificationType } from "@prisma/client";
// import { checkAdminAssociateInCompany, validateAdmin, validateTokenExpiredAt } from "@lib-shared/validators/admin-validator";
// import { hashPassword, verifyPassword } from "@lib-shared/utils/password-helper";

// import { Language } from "@shared/translations/i18n-config";
// import { LoginWithEmailPasswordBody } from "@lib-admin/schemas/user-schema";
// import { generateToken } from "@lib-shared/utils/token-generators";
// import { getTranslationStringFromPrismaJson } from "@lib-shared/utils/prisma-helper";
// import { paginatedModel } from "@lib-shared/models/pagination";
// import prisma from "@lib-shared/tools/prisma/prisma";
// import { resetPasswordEmail } from "@lib-shared/tools/mailers/emails";
// import { restErrorUnauthorized } from "@lib-shared/models/rest-error";
// import { sendEmail } from "@lib-shared/utils/mailers";
// import { setPasswordLink } from "@lib-services/next-auth-links";
// import { signedToken } from "@lib-shared/utils/jwt";
// import { upsertResetAdminPassword } from "./verification-token-controller";

// export async function logIn(params: LoginWithEmailPasswordBody, language: Language | string = Language.ENGLISH) {
//   const admin = await prisma.admin.findFirstOrThrow({
//     where: {
//       email: params.email,
//     },
//   });
//   validateAdmin(admin);
//   const isValid = await verifyPassword(params.password, admin.encryptedPassword ?? "");
//   if (!isValid) {
//     throw restErrorUnauthorized("sign_in.incorrect_password", language);
//   }
//   return await signedToken(admin);
// }

// export async function getAdmins(collectionParams: AdminCollectionParams) {
//   const params = getAdminDataCollectionParams(collectionParams);
//   const [admins, count] = await prisma.$transaction([prisma.admin.findMany(params), prisma.admin.count({ where: params.where })]);
//   return paginatedModel(admins, count, collectionParams.pagination);
// }

// export async function getAdminAll(companyId: number, body?: AdminsInPublicProfileIdBody) {
//   const orderBy = { email: Prisma.SortOrder.asc };
//   if (body?.publicProfileId) {
//     return (await prisma.publicProfile.findFirst({ where: { id: body.publicProfileId }, include: { admins: { orderBy } } }))?.admins ?? [];
//   } else {
//     return await prisma.admin.findMany({ where: { companyId }, orderBy });
//   }
// }

// export async function getAdminById(companyId: number, id: number) {
//   return await prisma.admin.findFirstOrThrow({ where: { id, companyId } });
// }

// export async function createAdmin(body: CreateAdminBody) {
//   const data = await createAdminInput(body);
//   return await prisma.admin.create({ data });
// }

// export async function updateAdmin(id: number, body: UpdateAdminBody) {
//   const data = await updateAdminInput(body);
//   return await prisma.admin.update({ where: { id }, data });
// }

// export async function deleteAdmin(companyId: number, id: number, validate = true) {
//   if (validate) {
//     await checkAdminAssociateInCompany(companyId, id);
//   }
//   const data = softDeleteAdminInput();
//   await prisma.admin.update({ where: { id }, data });
// }

// export async function resetPassword(params: AdminResetPasswordBody) {
//   const admin = await prisma.admin.findFirstOrThrow({ where: { email: params.email }, include: { company: true } });

//   const token = generateToken();
//   await upsertResetAdminPassword(token, admin.id);

//   const setPasswordlink = setPasswordLink(token.token);
//   const emailParams = resetPasswordEmail(params.email, getTranslationStringFromPrismaJson(admin.company?.name), setPasswordlink);
//   await sendEmail(emailParams);
// }

// export async function setPassword(params: AdminSetPasswordBody) {
//   let verificationToken = await prisma.verificationToken.findFirst({
//     where: { token: params.token, verificationType: VerificationType.ResetPassword },
//   });

//   verificationToken = await validateTokenExpiredAt(verificationToken);

//   const encryptedPassword = await hashPassword(params.password);
//   return await prisma.admin.update({
//     where: { id: verificationToken.adminId! },
//     data: {
//       encryptedPassword,
//       verificationToken: { delete: { id: verificationToken.id } },
//     },
//   });
// }
