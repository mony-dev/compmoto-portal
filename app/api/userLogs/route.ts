import { PrismaClient, Role, UserStatus } from "@prisma/client";
import { NextResponse } from "next/server";
const prisma = new PrismaClient();
import bcrypt from 'bcrypt'

export async function POST( request: Request,
  { body }: {  body: any }) {
  const data = await request.json();
  try {
    const createUser = await prisma.userLog.create({
      data: {
        userId: Number(data.userId),
        ipAddress: data.ipAddress
      }
    })
    return NextResponse.json(createUser);
  } catch (error) {
    return NextResponse.json(error);
  } finally {
    await prisma.$disconnect();
  }
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') || '';

    try {
      const userLogs = await prisma.userLog.findMany({
        where: {
          OR: [
            { ipAddress: { contains: q } },
          ],
        },
        include: {
            user: {
              select: {
                email: true,
                name: true
              }
            }
          }
      });
      return NextResponse.json(userLogs);
    } catch (error) {
      return NextResponse.json(error);
    } finally {
      await prisma.$disconnect();
    }
  }