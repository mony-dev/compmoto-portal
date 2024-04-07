// import { AdminRole, AdminStatus, UserRole, UserStatus } from "@prisma/client";
// import "next-auth";
// import "next-auth/jwt";

// type AuthRole = UserRole | AdminRole | undefined;
// type AuthStatus = UserStatus | AdminStatus;

// declare module "next-auth" {
//   /**
//    * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
//    */
//   interface Session {
//     sub: string | undefined;
//     role: AuthRole;
//     status: AuthStatus;
//     companyId: string | undefined;
//   }

//   interface User {
//     role: AuthRole;
//     companyId: string | undefined;
//   }
// }

// declare module "next-auth/jwt" {
//   /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
//   interface JWT {
//     role: AuthRole;
//     status: AuthStatus;
//     companyId: string | undefined;
//   }
// }
