import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    const { year, month, resetDate, brands } = data;

    // Create the SpecialBonus record
    const specialBonus = await prisma.specialBonus.create({
      data: {
        year: parseInt(year), // Ensure it's a number
        month: parseInt(month), // Ensure it's a number
        resetDate: new Date(resetDate), // Convert to Date object
        isActive: true, // Defaults to true if not provided
      },
    });

    // Create SpecialBonusItems for each brand and their items
    for (const brand of brands) {
      const { brandId, items } = brand;

      // Loop through items and create them with order (index + 1)
      items.forEach(async (item: any, index: number) => {
        await prisma.specialBonusItem.create({
          data: {
            specialBonusId: specialBonus.id, // Link to the created SpecialBonus
            totalPurchaseAmount: item.totalPurchaseAmount,
            cn: item.cn,
            incentivePoint: item.incentivePoint,
            brandId: brandId, // Link to the Brand
            order: index + 1, // Set order as index + 1
          },
        });
      });
    }

    return NextResponse.json({ success: true, specialBonus });
  } catch (error) {
    console.error("Error creating SpecialBonus:", error);
    return NextResponse.json({ error: "Error creating SpecialBonus" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function GET() {
  try {
    // Fetch the first active SpecialBonus (or modify query to suit your requirements)
    const specialBonus = await prisma.specialBonus.findFirst({
      where: {
        isActive: true,
      },
      include: {
        items: {
          include: {
            brand: true, // Include the related Brand for each SpecialBonusItem
          },
        },
      },
    });

    // If no special bonus is found
    if (!specialBonus) {
      return NextResponse.json({ });
    }

    // Structure the response to fit your form needs
    const responseData = {
      id: specialBonus.id,
      month: specialBonus.month,
      year: specialBonus.year,
      resetDate: specialBonus.resetDate,
      isActive: specialBonus.isActive,
      brands: specialBonus.items.reduce((acc: any[], item) => {
        const brandIndex = acc.findIndex((b) => b.brandId === item.brandId);
        const newItem = {
          totalPurchaseAmount: item.totalPurchaseAmount,
          cn: item.cn,
          incentivePoint: item.incentivePoint,
        };

        if (brandIndex > -1) {
          acc[brandIndex].items.push(newItem);
        } else {
          acc.push({
            brandId: item.brandId,
            brandName: item.brand.name,
            items: [newItem],
          });
        }

        return acc;
      }, []),
    };

    return NextResponse.json({ specialBonus: responseData });
  } catch (error) {
    console.error("Error fetching SpecialBonus:", error);
    return NextResponse.json({ error: "Error fetching SpecialBonus" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}