import { Admin, User } from "@prisma/client";
import { JWTPayload, SignJWT, jwtVerify } from "jose";

import { JWT } from "next-auth/jwt";

const secret = process.env.NEXTAUTH_SECRET;

export async function signedToken(user: User | Admin) {
  return await signJWT({
    email: user.email,
    sub: user.id,
    role: user.role,
    status: user.status,
  });
}

export async function signJWT(payload: object) {
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + 30 * 24 * 60 * 60; // 30d
  const jwt = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setExpirationTime(exp)
    .setIssuedAt(iat)
    .setNotBefore(iat)
    .sign(new TextEncoder().encode(secret));
  return jwt;
}

export async function verifyJWT(token: string) {
  const jwtVerifyResult = await jwtVerify(token, new TextEncoder().encode(secret));
  const { payload } = jwtVerifyResult;
  return payload as JWT & JWTPayload;
}
