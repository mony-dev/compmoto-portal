import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function PUT(request: Request) {
  try {
    const data = await request.json();
    const { id, year, month, resetDate, isActive, brands } = data;

    // Check if ID is provided
    if (!id) {
      return NextResponse.json({ error: "ID is required for updating" }, { status: 400 });
    }

    // Prepare the update data for SpecialBonus, only include fields if they are passed in the request body
    const updateData: any = {};

    if (year) {
      updateData.year = parseInt(year);
    }
    if (month) {
      updateData.month = parseInt(month);
    }
    if (resetDate) {
      const parsedResetDate = new Date(resetDate);
      if (!isNaN(parsedResetDate.getTime())) {
        updateData.resetDate = parsedResetDate;
      } else {
        return NextResponse.json({ error: "Invalid resetDate provided" }, { status: 400 });
      }
    }
    if (typeof isActive !== "undefined") {
      updateData.isActive = isActive;
    }



    // If there's nothing to update, return an error
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "No valid fields provided for update" }, { status: 400 });
    }

    // Update SpecialBonus entry
    const specialBonus = await prisma.specialBonus.update({
      where: { id },
      data: updateData,
    });

    // If brands are passed, update them
    if (brands && brands.length > 0) {
      // Delete existing SpecialBonusItem entries for the specialBonusId
      await prisma.specialBonusItem.deleteMany({
        where: { specialBonusId: id },
      });

      // Create the updated SpecialBonusItem entries
      const updatedItems = [];
      for (const brand of brands) {
        for (const [index, item] of brand.items.entries()) {
          const newItem: any = {
            specialBonusId: id,
            minisizeId: brand.minisizeId, // Link to the Brand
            totalPurchaseAmount: item.totalPurchaseAmount,
            cn: item.cn,
            incentivePoint: item.incentivePoint,
            order: index + 1, // Provide the order value based on the array index
          };
          // Only add color if it exists
          if (brand.color) {
            newItem.color = brand.color;
          }
      
          updatedItems.push(newItem);
        }
      }
      await prisma.specialBonusItem.createMany({
        data: updatedItems,
      });
    }

    return NextResponse.json({ specialBonus, message: "SpecialBonus updated successfully" });
  } catch (error) {
    console.error("Error updating SpecialBonus:", error);
    return NextResponse.json({ error: "An error occurred while updating the SpecialBonus" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

