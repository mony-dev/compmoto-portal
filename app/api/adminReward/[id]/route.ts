import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: { id: number } }
) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";
  const id = params.id;
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("pageSize") || "15");
  try {
    const [rewards, total] = await Promise.all([
      prisma.reward.findMany({
        where: {
          AND: [
            {
              rewardCategoryId: { equals: Number(id) },
            },
            {
              OR: [
                { name: { contains: q, mode: 'insensitive' } },
              ],
            },
          ],
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.reward.count({
        where: {
          AND: [
            {
              rewardCategoryId: { equals: Number(id) },
            },
            {
              OR: [
                { name: { contains: q, mode: 'insensitive' } },
              ],
            },
          ],
        },
      }),
    ]);
    return NextResponse.json({ rewards: rewards, total });
  } catch (error) {
    return NextResponse.json(error);
  } finally {
    await prisma.$disconnect();
  }
}
