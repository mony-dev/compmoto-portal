import { PrismaClient } from "@prisma/client";
import { seedSuperAdmin } from "./generate-super-admin";

export async function main() {
  const prisma = new PrismaClient({});

  await seedSuperAdmin(prisma);
  await prisma.$disconnect();
}

main();
