import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
import dayjs from 'dayjs';
const fetchTotalPurchase = async () => {
    try {
        // Find the first active TotalPurchase
        const activeTotalPurchase = await prisma.totalPurchase.findFirst({
            where: { isActive: true },
            include: { items: true },
        });

        if (!activeTotalPurchase) return;

        // Update the current TotalPurchase to inactive
        await prisma.totalPurchase.update({
            where: { id: activeTotalPurchase.id },
            data: { isActive: false },
        });

        // Check if the current month is less than or equal to resetDate's month
        const currentMonth = dayjs().month() + 1; // months are 0-indexed, so +1 for 1-12
        const resetMonth = dayjs(activeTotalPurchase.resetDate).month() + 1;

        if (currentMonth <= resetMonth) {
            // Duplicate the TotalPurchase
            const newTotalPurchase = await prisma.totalPurchase.create({
                data: {
                    month: currentMonth,
                    year: dayjs().year(),
                    resetDate: dayjs().endOf('month').toDate(),
                    isActive: true,
                    items: {
                        create: activeTotalPurchase.items.map(item => ({
                            totalPurchaseAmount: item.totalPurchaseAmount,
                            cn: item.cn,
                            incentivePoint: item.incentivePoint,
                            loyaltyPoint: item.loyaltyPoint,
                            order: item.order,
                        })),
                    },
                },
            });

            console.log('Duplicated TotalPurchase:', newTotalPurchase);
        }
    } catch (error) {
        console.error('Error in duplicating TotalPurchase:', error);
    }
}

fetchTotalPurchase().catch(console.error)
