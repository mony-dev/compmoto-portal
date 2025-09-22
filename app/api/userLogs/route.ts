import { PrismaClient, Role, UserStatus } from "@prisma/client";
import { NextResponse } from "next/server";
const prisma = new PrismaClient();
import bcrypt from "bcrypt";

export async function POST(request: Request, { body }: { body: any }) {
  const data = await request.json();
  try {
    const createUser = await prisma.userLog.create({
      data: {
        userId: Number(data.userId),
        ipAddress: data.ipAddress,
      },
    });
    return NextResponse.json(createUser);
  } catch (error) {
    return NextResponse.json(error);
  } finally {
    await prisma.$disconnect();
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("pageSize") || "15");

  try {
    const whereClause = q
      ? {
          OR: [
            { ipAddress: { contains: q } },
            { user: { email:  { contains: q } } }, 
          ],
        }
      : {};

    const [userLogs, total] = await Promise.all([
      prisma.userLog.findMany({
        where: whereClause,
        include: {
          user: {
            select: {
              email: true,
              name: true,
            },
          },
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.userLog.count({
        where: whereClause,
      }),
    ]);

    return NextResponse.json({ userLogs, total });
  } catch (error) {
    return NextResponse.json(error);
  } finally {
    await prisma.$disconnect();
  }
}
