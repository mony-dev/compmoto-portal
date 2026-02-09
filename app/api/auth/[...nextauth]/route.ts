import NextAuth from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";
import { compare } from "bcrypt";

const prisma = new PrismaClient();

// helper สำหรับดึงข้อมูลจาก NAV แค่ครั้งเดียวตอน login
async function fetchNavCustomerInfo(custNo: string) {
  try {
    const NAV_URL = process.env.NAV_URL!;
    const NAV_BASIC_AUTH = process.env.NAV_BASIC_AUTH!;
    const COMPANY_ID = process.env.COMPANY_ID!;

    const filter = encodeURIComponent(`CustNo eq '${custNo}'`);
    const url = `${NAV_URL}/companies(${COMPANY_ID})/api_MasterCustomerDetails?$filter=${filter}`;

    // กันเคสค้าง ด้วย timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: NAV_BASIC_AUTH,
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error(
        "NAV MasterCustomerDetails error:",
        response.status,
        await response.text()
      );
      return null;
    }

    const data = await response.json();
    return data?.value?.[0] ?? null;
  } catch (error) {
    console.error("Fetch NAV error:", error);
    return null;
  }
}

const handler = NextAuth({
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 1 day
    updateAge: 60 * 60, // 1 hour
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
              customerGroup: true,
            },
          });

          if (!user) {
            throw new Error("No user found with this customer no");
          }

          const passwordCorrect = await compare(
            credentials.password,
            user.encryptedPassword
          );
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
    async jwt({ token, user /* account, profile, isNewUser */ }) {
      const t = token as any;
      const u = user as any;

      // จะเข้าบล็อกนี้เฉพาะตอน "เพิ่ง login" (มี user)
      if (u) {
        t.id = u.id;
        t.role = u.role;
        t.custNo = u.custNo;
        t.rewardPoint = u.rewardPoint;
        t.status = u.status;
        t.custPriceGroup = u.custPriceGroup;
        t.image = u.image;
        t.customerGroupId = u.customerGroupId;

        // หา saleUserCustNo
        if (u.saleUserId) {
          try {
            const saleUser = await prisma.user.findUnique({
              where: { id: u.saleUserId },
            });
            if (saleUser) {
              t.saleUserCustNo = saleUser.custNo;
            }
          } catch (error) {
            console.error("Error fetching saleUser:", error);
          }
        }

        // หา customerGroup (discount / name)
        if (u.customerGroupId) {
          try {
            const customerGroup = await prisma.customerGroup.findUnique({
              where: { id: u.customerGroupId },
            });
            if (customerGroup) {
              t.customerDiscount = customerGroup.discount;
              t.customerGroupName = customerGroup.name;
            }
          } catch (error) {
            console.error("Error fetching customerGroup:", error);
          }
        }

        // 🔸 ยิง NAV แค่ตรงนี้ (ตอน login)
        if (u.custNo) {
          const customerInfo = await fetchNavCustomerInfo(u.custNo);
          if (customerInfo) {
            t.customerInfo = customerInfo;
          }
        }
      }

      return token;
    },

    async session({ session, token }) {
      const t = token as any;

      session.user = {
        ...session.user,
        role: t.role,
        id: t.id,
        custNo: t.custNo,
        rewardPoint: t.rewardPoint,
        status: t.status,
        custPriceGroup: t.custPriceGroup,
        image: t.image,
        saleUserCustNo: t.saleUserCustNo || null,
        customerGroupId: t.customerGroupId,
        customerDiscount: t.customerDiscount,
        customerGroupName: t.customerGroupName,
        // ข้อมูลจาก NAV ที่ยิงตอน login ครั้งแรก
        data: t.customerInfo ?? null,
      } as any;

      // ยังสามารถดึง userLog สด ๆ ได้อยู่ (ถ้าต้องการ)
      try {
        if (t.id) {
          const userLog = await prisma.userLog.findFirst({
            where: { userId: Number(t.id) },
            orderBy: { createdAt: "desc" },
          });

          if (userLog) {
            (session.user as any).latestUserLogCreatedAt = userLog.createdAt;
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
