import { JWTDecodeParams, JWTEncodeParams } from "next-auth/jwt";
import { signJWT, verifyJWT } from "@lib-shared/utils/jwt";

import CredentialsProvider from "next-auth/providers/credentials";
import { Language } from "@shared/translations/i18n-config";
import NextAuth from "next-auth";
import { User, UserStatus } from "@prisma/client";
import { logIn } from "@lib-admin/controllers/admin-controller";

const handler = NextAuth({
  session: {
    strategy: "jwt",
  },
  jwt: {
    maxAge: 60 * 60 * 24 * 30, // 30 days
    encode: async ({ token }: JWTEncodeParams) => {
      return await signJWT(token as object);
    },
    decode: async ({ token }: JWTDecodeParams) => {
      return await verifyJWT(token as string);
    },
  },
  providers: [
    CredentialsProvider({
      credentials: {
        email: {},
        password: {},
        locale: {},
      },
      // @ts-ignore
      async authorize(credentials) {
        if (!credentials) return null;
        const token = await logIn(credentials, credentials.locale);
        return token;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (!user) return token;
      if (typeof user === "string") {
        const u = await verifyJWT(user as string);
        return u;
      }
      token.sub = user?.id;
      token.role = user?.role;
      token.email = user?.email;
      token.companyId = user?.companyId;
      return token;
    },
    // @ts-ignore
    async signIn({ user }: { user: User | Admin; account: Account; profile: Profile }) {
      if (typeof user === "string") {
        const u = await verifyJWT(user);
        return u?.status == UserStatus.Active;
      }
      return true;
    },
    async redirect({ url }) {
      return url;
    },
    async session({ session, token }) {
      session.sub = token.sub;
      session.role = token?.role;
      session.status = token?.status;
      session.companyId = token?.companyId;
      if (session.user) {
        session.user = {
          email: token.email,
        };
      }
      return session;
    },
  },
});

export { handler as GET, handler as POST };
