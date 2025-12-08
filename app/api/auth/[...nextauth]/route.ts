import NextAuth from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";
import { compare } from "bcrypt";
import xml2js from "xml2js";

const prisma = new PrismaClient();

const handler = NextAuth({
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 1 day
    updateAge: 60 * 60,   // 1 hour
  },
  pages: {
    signIn: "/th/admin/sign-in",
    signOut: "/th/admin/sign-in",
    error: "/th/admin/sign-in",
    verifyRequest: "/th/admin/sign-in",
    newUser: "/th/admin/sign-in",
  },
  providers: [
    CredentialsProvider({
      credentials: {
        custNo: { label: "custNo", type: "text" },
        password: { label: "Password", type: "password" },
      },
      // @ts-ignore: TypeScript error explanation or ticket reference
      async authorize(credentials, req) {
        if (!credentials) return null;

        try {
          const user = await prisma.user.findUnique({
            where: { custNo: credentials.custNo },
            include: {
              saleUser: true,
              customerGroup: true
            },
          });

          if (!user) {
            throw new Error("No user found with this customer no");
          }

          const passwordCorrect = await compare(credentials.password, user.encryptedPassword);
          if (!passwordCorrect) {
            throw new Error("Invalid credentials");
          }

          return {
            ...user,
            id: user.id.toString(),
            role: user.role,
            status: user.status,
          };
        } catch (error) {
          console.error("Authorize error:", error);
          throw new Error("Invalid login credentials");
        }
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user, account, profile, isNewUser }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
        token.custNo = user.custNo;
        token.rewardPoint = user.rewardPoint;
        token.status = user.status;
        token.custPriceGroup = user.custPriceGroup;
        token.image = user.image;
        token.customerGroupId = user.customerGroupId;

        // Fetch and add saleUserCustNo if necessary
        if (user.saleUserId) {
          try {
            const saleUser = await prisma.user.findUnique({
              where: { id: user.saleUserId },
            });
            if (saleUser) {
              token.saleUserCustNo = saleUser.custNo;
            }
          } catch (error) {
            console.error("Error fetching saleUser:", error);
          }
        }
        if (user.customerGroupId) {
          try {
            const customerGroup = await prisma.customerGroup.findUnique({
              where: { id: user.customerGroupId },
            });
            if (customerGroup) {
              token.customerDiscount = customerGroup.discount;
              token.customerGroupName = customerGroup.name;

            }
          } catch (error) {
            console.error("Error fetching saleUser:", error);
          }
        }
      }

      return token;
    },
    async session({ session, token }) {
      session.user = {
        ...session.user,
        role: token.role,
        id: token.id,
        custNo: token.custNo,
        rewardPoint: token.rewardPoint,
        status: token.status,
        custPriceGroup: token.custPriceGroup,
        image: token.image,
        saleUserCustNo: token.saleUserCustNo || null,
        customerGroupId: token.customerGroupId,
        customerDiscount: token.customerDiscount,
        customerGroupName: token.customerGroupName
      };

      try {
        // Fetch the latest userLog entry for this user
        const userLog = await prisma.userLog.findFirst({
          where: { userId: Number(token.id) },
          orderBy: { createdAt: "desc" },
        });

        if (userLog) {
          session.user.latestUserLogCreatedAt = userLog.createdAt;
        }

        if (token.custNo) {
          // Fetch additional data from external API
          const NAV_URL = process.env.NAV_URL!;
          const NAV_BASIC_AUTH = process.env.NAV_BASIC_AUTH!;
          const COMPANY_ID = process.env.COMPANY_ID!;
        
          const filter = encodeURIComponent(`CustNo eq '${token.custNo}'`);
          const url = `${NAV_URL}/companies(${COMPANY_ID})/api_MasterCustomerDetails?$filter=${filter}`;
          const response = await fetch(url, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `${NAV_BASIC_AUTH}`, 
            },
          });

          if (!response.ok) {
            console.error("NAV MasterCustomerDetails error:", response.status, await response.text());
          } else {
            const data = await response.json();

            const customerInfo = data?.value?.[0] ?? null;

            if (customerInfo) {
              session.user.data = customerInfo;
            }
          }
        }
      } catch (error) {
        console.error("Session callback error:", error);
      }

      return session;
    },
  },
});

export { handler as GET, handler as POST };
