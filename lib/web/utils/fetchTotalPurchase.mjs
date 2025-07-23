import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
dayjs.extend(utc);
dayjs.extend(timezone);
const fetchTotalPurchase = async () => {
    try {
        // Find all active TotalPurchase
        const activePurchases = await prisma.totalPurchase.findMany({
            where: { isActive: true },
            include: {
                items: true,
                customerGroup: true
            },
        });


        if (!activePurchases.length) {
            console.log('No active TotalPurchase records found.');
            return;
        }

        // Check if the current month is less than or equal to resetDate's month
        const currentMonth = dayjs().month() + 1; // months are 0-indexed, so +1 for 1-12

        for (const purchase of activePurchases) {
            // 1. Set existing one to inactive
            await prisma.totalPurchase.update({
                where: { id: purchase.id },
                data: { isActive: false },
            });

            // 2. Duplicate it
            const newPurchase = await prisma.totalPurchase.create({
                data: {
                    name: `ยอดสั่งซื้อรวม ${purchase.customerGroup.name} ${currentMonth}/${dayjs().year()}`,
                    month: currentMonth,
                    year: dayjs().year(),
                    resetDate: dayjs().endOf('month').toDate(),
                    isActive: true,
                    customerGroupId: purchase.customerGroupId,
                    items: {
                        create: purchase.items.map(item => ({
                            totalPurchaseAmount: item.totalPurchaseAmount,
                            cn: item.cn,
                            incentivePoint: item.incentivePoint,
                            loyaltyPoint: item.loyaltyPoint,
                            order: item.order,
                        })),
                    },
                },
            });
            console.log(`✅ Duplicated TotalPurchase ID ${purchase.id} → New ID ${newPurchase.id}`);
        }
    } catch (error) {
        console.error('Error in duplicating TotalPurchase:', error);
    }
}

fetchTotalPurchase().catch(console.error)
