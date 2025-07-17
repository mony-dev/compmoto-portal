import { PrismaClient, Role, UserStatus } from "@prisma/client";
import { NextResponse } from "next/server";
const prisma = new PrismaClient();
import bcrypt from 'bcrypt'
import { encrypt } from "@lib-shared/utils/encryption";
import { startOfMonth, endOfMonth } from 'date-fns';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rolesString = searchParams.get('role');
  const roles = rolesString ? (rolesString.split(',').map(role => role.trim()) as Role[]) : [];
  const q = searchParams.get('q') || '';
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("pageSize") || "15");
  const statusQuery = Object.values(UserStatus).find(status => status === q);
  const roleQuery = Object.values(Role).find(role => role === q);
  const startDate = startOfMonth(new Date());
  const endDate = endOfMonth(new Date());

  try {
    const [users, total, usedPoints] = await Promise.all([
      prisma.user.findMany({
        where: {
          role: {
            in: roles,
          },
          OR: [
            { name: { contains: q } },
            { email: { contains: q } },
            ...(roleQuery ? [{ role: roleQuery }] : []),
            ...(statusQuery ? [{ status: statusQuery }] : []),
          ],
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),

      prisma.user.count({
        where: {
          role: {
            in: roles,
          },
          OR: [
            { name: { contains: q } },
            { email: { contains: q } },
            ...(roleQuery ? [{ role: roleQuery }] : []),
            ...(statusQuery ? [{ status: statusQuery }] : []),
          ],
        },
      }),

      // Fetch used points this month grouped by userId
      prisma.userReward.findMany({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        include: {
          reward: true,
        },
      }),
    ]);

    // Map userId to usedPoint = reward.point * quantity
    const usedPointMap: Record<number, number> = {};
    usedPoints.forEach(record => {
      const point = record.reward.point * record.quantity;
      usedPointMap[record.userId] = (usedPointMap[record.userId] || 0) + point;
    });

    // Add usedPoint to each user
    const usersWithUsedPoint = users.map(user => ({
      ...user,
      usedPoint: usedPointMap[user.id] || 0,
    }));
    return NextResponse.json({ users: usersWithUsedPoint, total });
  } catch (error) {
    return NextResponse.json({ error });
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST( request: Request,
  { body }: {  body: any }) {
  const data = await request.json();
  try {
    const hashedPassword = await bcrypt.hash(data.newPassword, 10)
    const encrypted = encrypt(data.newPassword);
    const createUser = await prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        role: data.role,
        custNo: data.custNo,
        encryptedPassword: hashedPassword,
        encryptedPasswordtext: encrypted
      }
    })
    
    return NextResponse.json(createUser);
  } catch (error) {
    return NextResponse.json(error);
  } finally {
    await prisma.$disconnect();
  }
}

