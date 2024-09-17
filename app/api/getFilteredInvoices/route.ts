import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
const prisma = new PrismaClient();

// Map the possible tables for lv1 and lv2 to the Prisma models
const tableModelMap: Record<string, keyof PrismaClient> = {
  ProductGroup: "productGroup",
  Size: "size",
  Rim: "rim",
  Brand: "brand",
  GroupType: "groupType",
  ComRate: "comRate",
  Family: "family",
};
function getFilterByType(filters: any[], type: string) {
  return filters.find((filter: any) => filter.type === type)?.selected || [];
}
const getCurrentYear = () => new Date().getFullYear();

const filterByMonthAndYear = (months: number[], years: number[]) => {
  const dateConditions: { date: { gte: Date; lte: Date; }; }[] = [];
  years.forEach((year) => {
    months.forEach((month) => {
      const startDate = new Date(Date.UTC(year, month - 1, 1)); // First day of the month
      const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999)); // Last day of the month
      dateConditions.push({
        date: {
          gte: startDate,
          lte: endDate,
        },
      });
    });
  });
  return dateConditions;
};

export async function POST(request: Request) {
  const body = await request.json(); // Parse the request body
  const { filters, userId } = body; // Extract the filters and userId from the body
  // Extract the brand IDs
  const brandFilters = getFilterByType(filters, "brand");
  const brandIds = brandFilters.map((item: any) => item.id);

  // Extract the size names
  const sizeFilters = getFilterByType(filters, "size");
  const sizeNames = sizeFilters.map((item: any) => item.name);

  // Extract the category names
  const categoryFilters = getFilterByType(filters, "category");
  const categoryNames = categoryFilters.map((item: any) => item.name);

  // Extract the product IDs
  const productFilters = getFilterByType(filters, "product");
  const productIds = productFilters.map((item: any) => item.id);

  // Extract the month IDs
  const monthFilters = getFilterByType(filters, "month");
  const months = monthFilters.map((item: any) => Number(item.id));

  // Extract the year IDs
  const yearFilters = getFilterByType(filters, "year");
  const years = yearFilters.length > 0 ? yearFilters.map((item: any) => Number(item.id)) : [getCurrentYear()];

  // Filter by month and year using date range
  let dateConditions: string | any[] = [];
  if (months.length > 0 && years.length > 0) {
    dateConditions = filterByMonthAndYear(months, years);
  }
  // Function to fetch the name from the relevant table for lv1 or lv2
  const getCategoryName = async (tableName: string, id: number) => {
    const model = tableModelMap[tableName];
    if (!model) return null;

    return (prisma as any)[model].findUnique({
      where: { id },
      select: { name: true },
    });
  };

  // Process lv1 filters (category)
  let lv1Conditions = [];
  if (categoryNames.length > 0) {
    lv1Conditions = await Promise.all(
      categoryNames.map(async (categoryName: any) => {
        // Dynamically find the matching products based on lv1 JSON
        const products = await prisma.product.findMany({
          include: {
            minisize: true,
          },
        });

        const matchingProducts = await Promise.all(
          products.map(async (product) => {
            // Check if minisize is null
            if (!product.minisize) return null;
        
            // Parse lv1 JSON safely
            const lv1Data = product.minisize.lv1 ? JSON.parse(product.minisize.lv1 as string) : null;
        
            // Check if lv1Data is null or empty
            if (!lv1Data || lv1Data.length === 0) return null;
        
            // Extract the table name from lv1Data
            const table = lv1Data[0]?.data;
        
            // Check if the table is in the tableModelMap and if lv1Id is not null
            if (table && tableModelMap[table] && product.lv1Id) {
              const category = await getCategoryName(table, product.lv1Id);
        
              // Check if the category name matches the selected category
              if (category?.name === categoryName) {
                return product;
              }
            }
        
            return null;
          })
        );

        return {
          id: {
            in: matchingProducts.filter(Boolean).map((product) => product?.id),
          },
        };
      })
    );
  }

  // Process lv2 filters (size)
  let lv2Conditions = [];
  if (sizeNames.length > 0) {
    lv2Conditions = await Promise.all(
      sizeNames.map(async (sizeName: any) => {
        const products = await prisma.product.findMany({
          include: {
            minisize: true,
          },
        });

        const matchingProducts = await Promise.all(
          products.map(async (product) => {
            // Check if minisize is null
            if (!product.minisize) return null;
        
            // Parse lv2 JSON safely, or return null if it's invalid
            const lv2Data = product.minisize.lv2 ? JSON.parse(product.minisize.lv2 as string) : null;
        
            // Check if lv2Data is null or empty
            if (!lv2Data || lv2Data.length === 0) return null;
        
            // Extract the table name from lv2Data
            const table = lv2Data[0]?.data;
        
            // Check if the table is in the tableModelMap and if lv2Id is not null
            if (table && tableModelMap[table] && product.lv2Id) {
              const size = await getCategoryName(table, product.lv2Id);
              
              // Check if the size name matches the selected size
              if (size?.name === sizeName) {
                return product;
              }
            }
        
            return null;
          })
        );
        

        return {
          id: {
            in: matchingProducts.filter(Boolean).map((product) => product?.id),
          },
        };
      })
    );
  }

  // Build the where condition dynamically based on filters
  const whereConditions: any = {
    userId: Number(userId),
  };
  // Add the date filter condition (use OR for multiple ranges)
  if (dateConditions.length > 0) {
    whereConditions.OR = dateConditions;
  }
  // Filter by brands
  if (brandIds.length > 0) {
    whereConditions.items = {
      some: {
        product: {
          brandId: {
            in: brandIds,
          },
        },
      },
    };
  }

  // Add lv1 and lv2 conditions if any
  if (lv1Conditions.length > 0) {
    whereConditions.items = {
      some: {
        product: {
          AND: [...lv1Conditions],
        },
      },
    };
  }

  if (lv2Conditions.length > 0) {
    whereConditions.items = {
      some: {
        product: {
          AND: [...lv2Conditions],
        },
      },
    };
  }

  // Filter by product IDs
  if (productIds.length > 0) {
    whereConditions.items = {
      some: {
        productId: {
          in: productIds,
        },
      },
    };
  }

  // Filter by month and year
  // if (months.length > 0 || years.length > 0) {
  //   whereConditions.date = {
  //     AND: [],
  //   };
  //   if (months.length > 0) {
  //     whereConditions.date.AND.push({
  //       month: {
  //         in: months,
  //       },
  //     });
  //   }
  //   if (years.length > 0) {
  //     whereConditions.date.AND.push({
  //       year: {
  //         in: years,
  //       },
  //     });
  //   }
  // }

  // Execute the Prisma query
  const invoices = await prisma.invoice.findMany({
    where: whereConditions,
    include: {
      items: true, // Include InvoiceItem with related products
    },
  });
  return NextResponse.json({ invoices: invoices });
}
