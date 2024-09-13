import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const data = await request.json();

    // Assuming the data for month and year comes as a string (e.g., "2024-05" for month)
    const month = new Date(data.month).getMonth() + 1; // Extracts the month as 1-12
    const year = new Date(data.year).getFullYear(); // Extracts the year (e.g., 2024)

    // Create TotalPurchase first
    const totalPurchase = await prisma.totalPurchase.create({
      data: {
        month, // Save month as 1-12
        year,  // Save year as 2024
        resetDate: new Date(data.resetDate), // Ensure the resetDate is in Date format
        isActive: data.isActive ?? true, // Defaults to true if not provided
      },
    });

    // Create TotalPurchaseItem for each item, associating with the newly created TotalPurchase
    const totalPurchaseItems = await prisma.totalPurchaseItem.createMany({
      data: data.items.map((item: any, index: number) => ({
        totalPurchaseId: totalPurchase.id, // Link to the created TotalPurchase
        totalPurchaseAmount: item.totalPurchaseAmount,
        cn: item.cn,
        incentivePoint: item.incentivePoint,
        loyaltyPoint: item.loyaltyPoint,
        order: index + 1, // Provide a default order if not provided
      })),
    });

    return NextResponse.json({ totalPurchase, totalPurchaseItems });
  } catch (error) {
    console.error("Error creating TotalPurchase and Items:", error);
    return NextResponse.json({ error: "An error occurred" });
  } finally {
    await prisma.$disconnect();
  }
}

export async function GET() {
  try {
    // Fetch the first active TotalPurchase
    const totalPurchase = await prisma.totalPurchase.findFirst({
      where: {
        isActive: true,
      },
      include: {
        items: true, // Include the related TotalPurchaseItem records
      },
    });

    return NextResponse.json({ totalPurchase });
  } catch (error) {
    console.error("Error fetching active TotalPurchase:", error);
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}