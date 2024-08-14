import NextAuth from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import { compare } from "bcrypt";
import xml2js from "xml2js";

const handler = NextAuth({
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/en/admin/sign-in",
    signOut: "/en/admin/sign-in",
    error: "/en/admin/sign-in",
    verifyRequest: "/en/admin/sign-in",
    newUser: "/en/admin/sign-in",
  },
  providers: [
    CredentialsProvider({
      credentials: {
        email: {},
        password: {},
      },
      async authorize(
        credentials: Record<"email" | "password", string> | undefined,
        req
      ) {
        if (credentials) {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });
          if (!user) {
            // User not found
            throw new Error("No user found with this email");
          }
          const passwordCorrect = await compare(
            credentials?.password || "",
            user?.encryptedPassword || ""
          );
          if (passwordCorrect) {
            // Passwords match
            const userWithRole = {
              ...user,
              id: user?.id.toString() || "",
              role: user?.role,
              status: user?.status
            };
            return Promise.resolve(userWithRole);
          }
        }
        return Promise.resolve(null);
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user, account, profile, isNewUser }) {
      if (user) {
        token.role = user.role;
        token.id = user.id || undefined;
        token.custNo = user.custNo;
        token.rewardPoint = user.rewardPoint;
        token.status = user.status
        token.custPriceGroup = user.custPriceGroup
      }
      return token;
    },
    async session({ session, token }) {
      if (session && session.user && token) {
        session.user.role = token.role;
        session.user.id = token.id;
        session.user.custNo = token.custNo;
        session.user.rewardPoint = token.rewardPoint;
        session.user.status = token.status;
        session.user.custPriceGroup = token.custPriceGroup

        // Fetch the latest userLog entry for this user
        const userLog = await prisma.userLog.findFirst({
          where: { userId: Number(token.id) },
          orderBy: { createdAt: 'desc' },
        });

        // Add the latest createdAt to the session
        if (userLog) {
          session.user.latestUserLogCreatedAt = userLog.createdAt;
        }
        if (token.custNo) {
          // Fetch user data from external API
          const response = await fetch(
            "http://49.0.64.73:9147/BC200/WS/Comp%20Test/Codeunit/WSIntegration",
            {
              method: "POST",
              headers: {
                SOAPACTION: "MasterCustomerDetail",
                "Content-Type": "application/xml",
                Authorization: "Basic QURNMDFAY21jLmNvbTpDb21wbW90bzkq",
              },
              body: `<?xml version="1.0" encoding="UTF-8"?>
          <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:wsc="urn:microsoft-dynamics-schemas/codeunit/WSIntegration">
             <soapenv:Header/>
             <soapenv:Body>
                <wsc:MasterCustomerDetail>
                  <wsc:p_gCustomer>${token.custNo}</wsc:p_gCustomer>
                  <wsc:p_oCustomers></wsc:p_oCustomers>
                </wsc:MasterCustomerDetail>
              </soapenv:Body>
          </soapenv:Envelope>`,
            }
          );

          const xml = await response.text();

          xml2js.parseString(xml, (err, result) => {
            if (err) {
              throw err;
            }
            // Add the data to the session
            const customerInfo =
              result["Soap:Envelope"]["Soap:Body"][0][
                "MasterCustomerDetail_Result"
              ][0]["p_oCustomers"][0]["PT_CustomerInfo"][0];
            session.user.data = customerInfo;
          });
        }

      }
      return session;
    },
  },
});

export { handler as GET, handler as POST };
