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

        // Check if the current month is less than or equal to resetDate's month
        const currentMonth = dayjs().month() + 1; // months are 0-indexed, so +1 for 1-12
        // const resetMonth = dayjs(activeTotalPurchase.resetDate).month() + 1;
        // const currentDay = dayjs().tz('Asia/Bangkok'); 
        // const resetDay = dayjs.utc(activeTotalPurchase.resetDate);
        // const formatCurrentDay = currentDay.format('YYYY-MM-DD'); 
        // const formatResetDay = resetDay.format('YYYY-MM-DD');

        // if (formatCurrentDay === formatResetDay) {
            // Update the current SpecialBonus to inactive
            await prisma.specialBonus.update({
                where: { id: activeSpecialBonus.id },
                data: { isActive: false }
            });

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
                            minisizeId: item.minisizeId,
                        })),
                    },
                },
            });

            console.log('Duplicated SpecialBonus:', newSpecialBonus);
        // }
    } catch (error) {
        console.error('Error in duplicating SpecialBonus:', error);
    }
}
fetchSpecialBonus().catch(console.error)
