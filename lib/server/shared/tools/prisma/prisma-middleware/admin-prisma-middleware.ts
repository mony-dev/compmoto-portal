// import { Prisma } from "@prisma/client";

// export const adminPrismaMiddleware: Prisma.Middleware = async (params: Prisma.MiddlewareParams, next) => {
//   if (params.model == "Admin") {
//     if (params.action === "findUnique" || params.action === "findFirst" || params.action === ("findUniqueOrThrow" as any)) {
//       params.args.where["deletedAt"] = null;
//     } else if (params.action === "findMany") {
//       if (params.args.where) {
//         if (params.args.where.deletedAt == undefined) {
//           params.args.where["deletedAt"] = null;
//         }
//       } else {
//         params.args["where"] = { deletedAt: null };
//       }
//     } else if (params.action == "delete") {
//       params.action = "update";
//       params.args["data"] = { deletedAt: new Date() };
//     } else if (params.action == "deleteMany") {
//       params.action = "updateMany";
//       if (params.args.data != undefined) {
//         params.args.data["deletedAt"] = new Date();
//       } else {
//         params.args["data"] = { deletedAt: new Date() };
//       }
//     }
//   }

//   return await next(params);
// };
