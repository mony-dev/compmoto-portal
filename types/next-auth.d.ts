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
//     name: string | null;
//     email: string | null;
//     image: string | null;
//     role: Role;
//   }

//   interface User {
//     role: AuthRole;
//     // companyId: string | undefined;
//   }
// }

// declare module "next-auth/jwt" {
//   /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
//   interface JWT {
//     role: AuthRole;
//     status: AuthStatus;
//     // companyId: string | undefined;
//   }
// }

// import { Session } from "next-auth";
// import { Role } from "@prisma/client";

// declare module "next-auth" {
//   interface Session {
//     user: {
//       id: string | undefined;
//       name: string | null;
//       email: string | null;
//       image: string | null;
//       role: Role;
//     };
//   }
// }
import NextAuth from "next-auth"
import { User as NextAuthUser } from "next-auth"



declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface User extends NextAuthUser {
    role: string | undefined;
    id: string;
    custNo: string;
    rewardPoint: number;
    status: string;
    custPriceGroup: string;
    saleUserId: number;
    image: string;
  }
  
  interface Session {
    user: {
      /** The user's postal address. */
      role: string;
      rewardPoint: internal;
      id: int; // Add this line
      status: string;
      custPriceGroup: string;
      image: string;
      saleUserId: number;
      custNo: string;
    } & DefaultSession["user"]
  }
}