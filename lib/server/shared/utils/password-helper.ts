import { compare, hash } from "bcryptjs";

export async function hashPassword(password: string) {
  return await hash(password, Number(process.env.SALT_PASSWORD));
}

export async function verifyPassword(password: string, hashedPassword: string) {
  return await compare(password, hashedPassword);
}
