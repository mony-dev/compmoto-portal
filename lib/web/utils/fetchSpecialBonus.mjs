import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
import dayjs from 'dayjs';
const fetchSpecialBonus = async () => {
    try {
        // Find all active SpecialBonus
        const activeSpecialBonus = await prisma.specialBonus.findMany({
            where: { isActive: true },
            include: {
                items: true,
                customerGroup: true
            },
        });

        if (!activeSpecialBonus.length) {
            console.log('No active SpecialBonus records found.');
            return;
        }
        // Check if the current month is less than or equal to resetDate's month
        const currentMonth = dayjs().month() + 1; // months are 0-indexed, so +1 for 1-12
        for (const bonus of activeSpecialBonus) {
            // 1. Set existing one to inactive
            await prisma.specialBonus.update({
                where: { id: bonus.id },
                data: { isActive: false },
            });

            // 2. Duplicate it
            const newBonus = await prisma.specialBonus.create({
                data: {
                    name: `โบนัสพิเศษ ${bonus.customerGroup.name} ${currentMonth}/${dayjs().year()}`,
                    month: currentMonth,
                    year: dayjs().year(),
                    resetDate: dayjs().endOf('month').toDate(),
                    isActive: true,
                    customerGroupId: bonus.customerGroupId,
                    items: {
                        create: bonus.items.map(item => ({
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
            console.log(`✅ Duplicated SpecialBonus ID ${bonus.id} → New ID ${newBonus.id}`);
        }
    } catch (error) {
        console.error('Error in duplicating SpecialBonus:', error);
    } finally {
        await prisma.$disconnect()
    }
}
fetchSpecialBonus().catch(console.error)
