import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
const prisma = new PrismaClient();
import bcrypt from 'bcrypt'
import { equal } from "assert";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || '';

  try {
    const rewardCategory = await prisma.rewardCategory.findMany({
      where: {
        OR: [
          { name: { contains: q } },
        ],
      },
      include: {
        rewards: true
      },
    });
    return NextResponse.json(rewardCategory);
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