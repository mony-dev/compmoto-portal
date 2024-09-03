import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: { id: number } }
) {
  const id = params.id;
  try {
    const minisize = await prisma.minisize.findUnique({
      where: { id: Number(id) },
      include: {
        products: true,
        promotions: true,
        media: true,
        news: true,
      },
    });

    const hasRelations =
  (minisize && minisize.promotions && minisize.promotions.length > 0) ||
  (minisize && minisize.media && minisize.media.length > 0) ||
  (minisize && minisize.news && minisize.news.length > 0);

    return NextResponse.json({ hasRelations });
  } catch (error) {
    return NextResponse.json({ message: "Error checking relations" });
  } finally {
    await prisma.$disconnect();
  }
}