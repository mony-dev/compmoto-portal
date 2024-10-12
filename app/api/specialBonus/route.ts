// api/specialBonus.ts

import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

// export async function GET(request: Request) {
//   const page = 1;
//   const pageSize = 50;

//   try {
//     const specialBonus = await prisma.specialBonus.findFirst({
//       where: {
//         isActive: true,
//       },
//       include: {
//         items: {
//           orderBy: {
//             order: "asc",
//           },
//           include: {
//             brand: {
//               include: {
//                 minisizes: true,
//               },
//             },
//           },
//         },
//       },
//     });
//     return NextResponse.json({ data: specialBonus, total: 1 });
//   } catch (error) {
//     return NextResponse.json(error);
//   } finally {
//     await prisma.$disconnect();
//   }
// }


export async function GET() {
  try {
    // Fetch the first active SpecialBonus (or modify query to suit your requirements)
    const specialBonus = await prisma.specialBonus.findFirst({
      where: {
        isActive: true,
      },
      include: {
        items: {
          orderBy: {
            order: "asc",
          },
          include: {
            // brand: {
            //   include: {
            //     minisizes: true,
            //   },
            // },
            minisize: {
              include: {brands: true}
            }
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
      items: specialBonus.items.sort((a, b) => a.order - b.order)
    };
    return NextResponse.json({ specialBonus: responseData });
  } catch (error) {
    console.error("Error fetching SpecialBonus:", error);
    return NextResponse.json({ error: "Error fetching SpecialBonus" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}