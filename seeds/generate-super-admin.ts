// import { AdminRole, Prisma, PrismaClient } from "@prisma/client";

// import { hash } from "bcryptjs";

// export async function seedSuperAdmin(prisma: PrismaClient) {
//   console.log("aaan");

//   const encryptedPassword = await hash("password", Number(process.env.SALT_PASSWORD));
//   const adminParams: Prisma.AdminCreateInput = {
//     firstName: {
//       en: "Super",
//       th: "ซุปเปอร์",
//       my: "",
//     },
//     lastName: {
//       en: "Admin",
//       th: "แอดมิน",
//     },
//     title: {
//       en: "SuerAdmin",
//       th: "ซุปเปอร์แอดมิน",
//     },
//     email: "super-admin@example.com",
//     encryptedPassword,
//     role: AdminRole.SuperAdmin,
//   };
//   console.log("aaan");

//   await prisma.admin.create({ data: adminParams });

//   console.log("Successfully seeded super admin");
// }
