// import { Prisma, UserStatus } from "@prisma/client";

// import { DateTime } from "luxon";

// export function softDeleteUserInput(): Prisma.XOR<Prisma.UserUpdateInput, Prisma.UserUncheckedUpdateInput> {
//   const now = DateTime.now();
//   return {
//     firstName: {},
//     lastName: {},
//     status: UserStatus.Inactive,
//     deletedAt: now.toJSDate(),
//   };
// }
