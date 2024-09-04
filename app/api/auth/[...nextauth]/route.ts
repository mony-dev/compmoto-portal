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
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
       // @ts-ignore: TypeScript error explanation or ticket reference
      async authorize(credentials, req) {
        if (!credentials) return null;

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
            include: { saleUser: true },
          });

          if (!user) {
            throw new Error("No user found with this email");
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
          const response = await fetch("http://49.0.64.73:9147/BC200/WS/Comp%20Test/Codeunit/WSIntegration", {
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
          });
  
          const xml = await response.text();
  
          xml2js.parseString(xml, (err, result) => {
            if (err) {
              console.error("XML parsing error:", err);
              return;
            }
  
            const customerInfo = result["Soap:Envelope"]["Soap:Body"][0]["MasterCustomerDetail_Result"][0]["p_oCustomers"][0]["PT_CustomerInfo"][0];
            session.user.data = customerInfo;
          });
        }
      } catch (error) {
        console.error("Session callback error:", error);
      }
  
      return session;
    },
  },
});

export { handler as GET, handler as POST };
