import { PrismaClient, Role, UserStatus } from "@prisma/client";
import { NextResponse } from "next/server";
const prisma = new PrismaClient();
import bcrypt from 'bcrypt'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rolesString = searchParams.get('role');
  const roles = rolesString ? (rolesString.split(',') as Role[]) : [];
  const q = searchParams.get('q') || '';

  const statusQuery = Object.values(UserStatus).find(status => status === q);
  const roleQuery = Object.values(Role).find(role => role === q);

  try {
    const users = await prisma.user.findMany({
      where: {
        role: {
          in: roles,
        },
        OR: [
          { name: { contains: q } },
          { email: { contains: q } },
          ...(roleQuery ? [{ role: { equals: roleQuery as Role } }] : []),
          ...(statusQuery ? [{ status: { equals: statusQuery as UserStatus } }] : []),
        ],
      },
    });
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json(error);
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST( request: Request,
  { body }: {  body: any }) {
  const data = await request.json();
  try {
    const hashedPassword = await bcrypt.hash('password', 10)
    const createUser = await prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        role: data.role,
        custNo: data.custNo,
        encryptedPassword: hashedPassword,
      }
    })
    
    return NextResponse.json(createUser);
  } catch (error) {
    return NextResponse.json(error);
  } finally {
    await prisma.$disconnect();
  }
}