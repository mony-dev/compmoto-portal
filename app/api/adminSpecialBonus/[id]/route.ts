import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

// export async function PUT(request: Request) {
//   try {
//     const data = await request.json();
//     const { id, year, month, resetDate, isActive, name, customerGroupId } = data;

//     // Check if ID is provided
//     if (!id) {
//       return NextResponse.json({ error: "ID is required for updating" }, { status: 400 });
//     }

//     // Prepare the update data for SpecialBonus, only include fields if they are passed in the request body
//     const updateData: any = {};

//     if (year) {
//       updateData.year = parseInt(year);
//     }
//     if (month) {
//       updateData.month = parseInt(month);
//     }
//     if (resetDate) {
//       const parsedResetDate = new Date(resetDate);
//       if (!isNaN(parsedResetDate.getTime())) {
//         updateData.resetDate = parsedResetDate;
//       } else {
//         return NextResponse.json({ error: "Invalid resetDate provided" }, { status: 400 });
//       }
//     }

//     // If there's nothing to update, return an error
//     if (Object.keys(updateData).length === 0) {
//       return NextResponse.json({ error: "No valid fields provided for update" }, { status: 400 });
//     }

//     // Update SpecialBonus entry
//     const specialBonus = await prisma.specialBonus.update({
//       where: { id },
//       data: {...updateData, isActive, name, customerGroupId },
//     });

//     // If brands are passed, update them
//     // if (brands && brands.length > 0) {
//     //   // Delete existing SpecialBonusItem entries for the specialBonusId
//     //   await prisma.specialBonusItem.deleteMany({
//     //     where: { specialBonusId: id },
//     //   });

//     //   // Create the updated SpecialBonusItem entries
//     //   const updatedItems = [];
//     //   for (const brand of brands) {
//     //     for (const [index, item] of brand.items.entries()) {
//     //       const newItem: any = {
//     //         specialBonusId: id,
//     //         minisizeId: brand.minisizeId, // Link to the Brand
//     //         totalPurchaseAmount: item.totalPurchaseAmount,
//     //         cn: item.cn,
//     //         incentivePoint: item.incentivePoint,
//     //         order: index + 1, // Provide the order value based on the array index
//     //       };
//     //       // Only add color if it exists
//     //       if (brand.color) {
//     //         newItem.color = brand.color;
//     //       }
      
//     //       updatedItems.push(newItem);
//     //     }
//     //   }
//     //   await prisma.specialBonusItem.createMany({
//     //     data: updatedItems,
//     //   });
//     // }

//     return NextResponse.json({ specialBonus, message: "SpecialBonus updated successfully" });
//   } catch (error) {
//     console.error("Error updating SpecialBonus:", error);
//     return NextResponse.json({ error: "An error occurred while updating the SpecialBonus" }, { status: 500 });
//   } finally {
//     await prisma.$disconnect();
//   }
// }

export async function PUT(request: Request) {
  try {
    const data = await request.json();
    const { id, name, isActive, brands } = data;

    if (!id) {
      return NextResponse.json({ error: "ID is required for updating" }, { status: 400 });
    }

    // อนุญาตแก้เฉพาะ 3 field
    const updateHeader: any = {};
    if (typeof name === "string") updateHeader.name = name;
    if (typeof isActive === "boolean") updateHeader.isActive = isActive;

    // แปลง brands -> flat items
    const flatItems: Array<{
      id?: number;
      minisizeId: number;
      color?: string | null;
      totalPurchaseAmount: number;
      cn: number;
      incentivePoint: number;
      order: number;
    }> = [];

    if (Array.isArray(brands)) {
      for (const brand of brands) {
        const minisizeId = Number(brand.minisizeId);
        const color = brand.color ?? null;

        if (!minisizeId || !Array.isArray(brand.items)) continue;

        brand.items.forEach((it: any, idx: number) => {
          flatItems.push({
            id: it.id ? Number(it.id) : undefined,
            minisizeId,
            color,
            totalPurchaseAmount: Number(it.totalPurchaseAmount ?? 0),
            cn: Number(it.cn ?? 0),
            incentivePoint: Number(it.incentivePoint ?? 0),
            order: idx + 1, // order ตามตำแหน่งใน array
          });
        });
      }
    }

    const incomingIds = flatItems.filter((x) => x.id).map((x) => x.id!);

    const result = await prisma.$transaction(async (tx) => {
      // 1) update header (เฉพาะ name/isActive)
      const specialBonus = await tx.specialBonus.update({
        where: { id: Number(id) },
        data: updateHeader,
      });

      // ถ้าไม่ได้ส่ง brands มา ไม่แตะ items
      if (!Array.isArray(brands)) return specialBonus;

      // 2) delete items ที่ user ลบออก
      await tx.specialBonusItem.deleteMany({
        where: {
          specialBonusId: Number(id),
          ...(incomingIds.length ? { id: { notIn: incomingIds } } : {}),
        },
      });

      // 3) upsert per item
      for (const it of flatItems) {
        if (it.id) {
          const r = await tx.specialBonusItem.updateMany({
            where: { id: it.id, specialBonusId: Number(id) },
            data: {
              minisizeId: it.minisizeId,
              color: it.color,
              totalPurchaseAmount: it.totalPurchaseAmount,
              cn: it.cn,
              incentivePoint: it.incentivePoint,
              order: it.order,
            },
          });

          if (r.count === 0) {
            throw new Error(`Invalid item id ${it.id} for specialBonusId ${id}`);
          }
        } else {
          await tx.specialBonusItem.create({
            data: {
              specialBonusId: Number(id),
              minisizeId: it.minisizeId,
              color: it.color,
              totalPurchaseAmount: it.totalPurchaseAmount,
              cn: it.cn,
              incentivePoint: it.incentivePoint,
              order: it.order,
            },
          });
        }
      }

      return specialBonus;
    });

    return NextResponse.json({ specialBonus: result, message: "SpecialBonus updated successfully" });
  } catch (error: any) {
    console.error("Error updating SpecialBonus:", error);
    return NextResponse.json(
      { error: error?.message ?? "An error occurred while updating the SpecialBonus" },
      { status: 500 }
    );
  }
}