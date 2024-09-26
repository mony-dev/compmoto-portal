import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
  
    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }
    const currentYear = new Date().getFullYear();
    try {
      // Query invoices for the user in the current year, grouping by month
      const responseData = await prisma.invoice.groupBy({
        by: ['date'],
        where: {
          userId: Number(userId),
          date: {
            gte: new Date(currentYear, 0, 1), // Start of current year (January 1st)
            lt: new Date(currentYear + 1, 0, 1), // End of current year (December 31st)
          },
        },
        _sum: {
          totalPrice: true,
        },
        orderBy: {
          date: 'asc',
        },
      });
  
      // Format the data to group by months and sum the totalPrice for each month
      const monthlyTotals = responseData.reduce((acc: any, invoice: any) => {
        const month = new Date(invoice.date).getMonth(); // Get month from date
        acc[month] = (acc[month] || 0) + invoice._sum.totalPrice;
        return acc;
      }, {});
  
      return NextResponse.json({ total: monthlyTotals });
    } catch (error) {
      return NextResponse.json({ error }, { status: 500 });
    } finally {
      await prisma.$disconnect();
    }
  }
