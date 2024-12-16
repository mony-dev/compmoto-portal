import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: { id: number } }
) {
  const { searchParams } = new URL(request.url);
  const userId = params.id; 
  try {
    // Parse the userId from query parameters
    const { searchParams } = new URL(request.url);

    if (!userId) {
      return NextResponse.json(
        { error: "Invalid or missing userId." },
        { status: 400 }
      );
    }

    // Get the start and end dates of the current month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Group invoices by userId, sum the totalPrice, and filter by current month
    const userTotals = await prisma.invoice.groupBy({
      by: ["userId"],
      where: {
        date: {
          gte: startOfMonth, // Greater than or equal to the first day of the month
          lte: endOfMonth,   // Less than or equal to the last day of the month
        },
      },
      _sum: {
        totalPrice: true,
      },
      orderBy: {
        _sum: {
          totalPrice: "asc", // Order by the sum of totalPrice in ascending order
        },
      },
    });
    // Find the index of the userId in the sorted totals
    const userIndex = userTotals.findIndex(user => user.userId === Number(userId));
    if (userIndex === -1) {
      return NextResponse.json(
        { rank: '-' },
      );
    }

    // Return the user's rank, totalPrice, and the full list
    return NextResponse.json({
      // userId,
      // totalPrice: userTotals[userIndex]._sum.totalPrice,
      rank: userIndex + 1 // Rank is index + 1 (1-based)
      // userTotals,
    });
  } catch (error) {
    // Handle errors and respond with an error message
    console.error("Error fetching invoices:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching invoices." },
      { status: 500 }
    );
  } finally {
    // Ensure Prisma connection is closed
    await prisma.$disconnect();
  }
}