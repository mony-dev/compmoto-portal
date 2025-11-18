import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
import dayjs from 'dayjs';

const fetchRewardPoint = async () => {
 
    try {
        // Find all active RewardPoint
        const currentRewardPoint = await prisma.rewardPoint.findMany({
            where: { isFinalize: true },
            include: {
                customerGroup: true
            },
        });

        if (!currentRewardPoint.length) {
            console.log('No active RewardPOint records found.');
            return;
        }
        const currentMonth = dayjs().month() + 1;
        for (const reward of currentRewardPoint) {
            // 1. Set existing one to inactive
            await prisma.rewardPoint.update({
                where: { reward: reward.id },
                data: { isFinalize: false },
            });

            const activePurchases = await prisma.totalPurchase.findFirst({
                where: { isActive: true, customerGroupId: reward.customerGroupId }
            });
            const activeSpecialBonus = await prisma.specialBonus.findFirst({
                where: { isActive: true, customerGroupId: reward.customerGroupId }
            });

            if (!activePurchases.length || !activeSpecialBonus.length) {
                console.log('No activePurchases or activeSpecialBonus  records found.');
                return;
            }
            // 2. Duplicate it
            const newRewardPoint = await prisma.rewardPoint.create({
                data: {
                    name: `Reward Point ${reward.customerGroup.name} ${currentMonth}/${dayjs().year()}`,
                    month: currentMonth,
                    year: dayjs().year(),
                    resetDate: dayjs().endOf('month').toDate(),
                    isFinalize: true,
                    expenses: reward.expenses,
                    point: reward.point,
                    customerGroupId: reward.customerGroupId,
                    totalPurchaseId: activePurchases.id,
                    specialBonusId: activeSpecialBonus.id
                },
            });
            console.log(`✅ Duplicated rewardPoint ID ${reward.id} → New ID ${newRewardPoint.id}`);
        }
    } catch (error) {
        console.error('Error in duplicating RewardPoint:', error);
    } finally {
        await prisma.$disconnect()
    }
}
fetchRewardPoint().catch(console.error)
