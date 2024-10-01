import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
import dayjs from 'dayjs';
const fetchSpecialBonus = async () => {
    try {
        // Find the first active SpecialBonus
        const activeSpecialBonus = await prisma.specialBonus.findFirst({
            where: { isActive: true },
            include: { items: true },
        });

        if (!activeSpecialBonus) return;

        // Update the current SpecialBonus to inactive
        await prisma.specialBonus.update({
            where: { id: activeSpecialBonus.id },
            data: { isActive: false },
        });

        // Check if the current month is less than or equal to resetDate's month
        const currentMonth = dayjs().month() + 1; // months are 0-indexed, so +1 for 1-12
        const resetMonth = dayjs(activeSpecialBonus.resetDate).month() + 1;

        if (currentMonth <= resetMonth) {
            // Duplicate the SpecialBonus
            const newSpecialBonus = await prisma.specialBonus.create({
                data: {
                    month: currentMonth,
                    year: dayjs().year(),
                    resetDate: dayjs().endOf('month').toDate(),
                    isActive: true,
                    items: {
                        create: activeSpecialBonus.items.map(item => ({
                            totalPurchaseAmount: item.totalPurchaseAmount,
                            cn: item.cn,
                            incentivePoint: item.incentivePoint,
                            order: item.order,
                            color: item.color,
                            brandId: item.brandId,
                        })),
                    },
                },
            });

            console.log('Duplicated SpecialBonus:', newSpecialBonus);
        }
    } catch (error) {
        console.error('Error in duplicating SpecialBonus:', error);
    }
}
fetchSpecialBonus().catch(console.error)
