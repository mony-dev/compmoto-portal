import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
const prisma = new PrismaClient();
import bcrypt from 'bcrypt'
import { equal } from "assert";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || '';
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("pageSize") || "15");
  try {
    const [rewardCategories, total] = await Promise.all([
      prisma.rewardCategory.findMany({
        where: {
          OR: [
            { name: { contains: q } },
          ],
        },
        include: {
          rewards: true
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.rewardCategory.count({
        where: {
          OR: [
            { name: { contains: q } },
          ],
        },
      }),
    ]);
    return NextResponse.json({ rewardCategories: rewardCategories, total });
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
    const createCate = await prisma.rewardCategory.create({
      data: {
        name: data.name,
        isActive: data.isActive,
      }
    })
    return NextResponse.json(createCate);
  } catch (error) {
    return NextResponse.json(error);
  } finally {
    await prisma.$disconnect();
  }
}