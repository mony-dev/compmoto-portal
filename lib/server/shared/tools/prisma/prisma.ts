import { PrismaClient } from "@prisma/client";
import { adminPrismaMiddleware } from "./prisma-middleware/admin-prisma-middleware";
// import { postPrismaMiddleware } from "./prisma-middleware/post-prisma-middleware";
import { userPrismaMiddleware } from "./prisma-middleware/user-prisma-middleware";

interface CustomNodeJsGlobal extends NodeJS.Global {
  prisma: PrismaClient;
}

declare const global: CustomNodeJsGlobal;

const prisma =
  global.prisma ||
  new PrismaClient({
    errorFormat: process.env.NODE_ENV == "development" ? "pretty" : "minimal",
    log: process.env.NODE_ENV == "development" ? ["query", "info", "warn", "error"] : ["warn", "error"],
  });

prisma.$use(userPrismaMiddleware);
prisma.$use(adminPrismaMiddleware);
// prisma.$use(postPrismaMiddleware);

if (process.env.NODE_ENV == "development") global.prisma = prisma;

export default prisma;
