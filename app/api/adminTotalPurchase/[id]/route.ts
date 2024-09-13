import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function PUT(request: Request) {
  try {
    const data = await request.json();

    const { id, month, year, resetDate, isActive, items } = data;

    if (!id) {
      return NextResponse.json({ error: "ID is required for updating" }, { status: 400 });
    }

    // Prepare the data for the update
    const updateData: any = {};

    // If month and year are passed, update them
    if (month) updateData.month = parseInt(month);
    if (year) updateData.year = parseInt(year);

    // If resetDate is passed, update it
    if (resetDate) updateData.resetDate = new Date(resetDate);

    // Always update isActive if it's passed, including when it is set to false
    if (typeof isActive !== 'undefined') updateData.isActive = isActive;

    // Update TotalPurchase entry
    const totalPurchase = await prisma.totalPurchase.update({
      where: { id },
      data: updateData, // Update only the fields that were passed
    });

    // If items are passed, update them
    if (items && items.length > 0) {
      // Delete existing items before adding new ones (if the structure changes)
      await prisma.totalPurchaseItem.deleteMany({
        where: { totalPurchaseId: id },
      });

      // Add updated items (or new items)
      const updatedItems = await prisma.totalPurchaseItem.createMany({
        data: items.map((item: any, index: number) => ({
          totalPurchaseId: id,
          totalPurchaseAmount: item.totalPurchaseAmount,
          cn: item.cn,
          incentivePoint: item.incentivePoint,
          loyaltyPoint: item.loyaltyPoint,
          order: index + 1
        })),
      });

      return NextResponse.json({ totalPurchase, updatedItems });
    }

    return NextResponse.json({ totalPurchase });
  } catch (error) {
    console.error("Error updating TotalPurchase:", error);
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
