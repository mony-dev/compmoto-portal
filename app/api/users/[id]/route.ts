import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import { startOfMonth, endOfMonth } from "date-fns";

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: { id: number } }
) {
  const { searchParams } = new URL(request.url);
  const id = Number(params.id);
  const month = searchParams.get("month");
  const year = searchParams.get("year");

  if (!month || !year) {
    return NextResponse.json({ error: "Missing 'month' or 'year'" }, { status: 400 });
  }

  const startDate = startOfMonth(new Date(Number(year), Number(month) - 1));
  const endDate = endOfMonth(new Date(Number(year), Number(month) - 1));

  try {
    // Fetch the user and their minisizes
    const user = await prisma.user.findUnique({
      where: { id },
      include: { minisizes: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Sum used points this month
    const usedPointAgg = await prisma.userReward.findMany({
      where: {
        userId: id,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        reward: true,
      },
    });
    const usedPoint = usedPointAgg.reduce((sum, r) => {
      return sum + (r.reward.point * r.quantity);
    }, 0);
    // Return user + usedPoint
    return NextResponse.json({ ...user, usedPoint });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(error);
  } finally {
    await prisma.$disconnect();
  }
}

type Role = 'USER' | 'ADMIN' | 'SUPER_ADMIN' | 'CLAIM' | 'SALE';

interface dataBodyInterface {
  name: string;
  email: string;
  role?: Role;
  phoneNumber?: string;
  saleUserId?: number;
  custNo?: string;
  minisizes?: [];
}

export async function PUT(
  request: Request,
  { params }: { params: { id: number } }
) {
  const data = await request.json();
  const id = params.id;

  let dataBody: Omit<dataBodyInterface, 'minisizeIds'> = {
    name: data.name,
    email: data.email,
  };
  
  if (data.role) {
    dataBody.role = data.role;
  }
  if (data.phoneNumber) {
    dataBody.phoneNumber = data.phoneNumber;
  }
  if (data.saleUserId) {
    dataBody.saleUserId = data.saleUserId;
  }
  if (data.custNo) {
    dataBody.custNo = data.custNo;
  }

  try {
    const updatedUser = await prisma.user.update({
      where: {
        id: Number(id),
      },
      data: {
        ...dataBody,
        minisizes: {
          set: data.minisizeIds?.map((minisizeId: number) => ({
            id: minisizeId,
          })),
        },
      },
      include: {
        minisizes: true, // Include minisizes in the response if needed
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(error);
  } finally {
    await prisma.$disconnect();
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: number } }
) {
  const id = params.id;
  try {
    const deletedUser = await prisma.user.delete({
      where: {
        id: Number(id),
      },
    });
    return NextResponse.json(deletedUser);
  } catch (error) {
    return NextResponse.json(error);
  } finally {
    await prisma.$disconnect();
  }
}
