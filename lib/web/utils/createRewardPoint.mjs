import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

const createRewardPoint = async () => {
    const start = new Date();
    const month = start.getUTCMonth() + 1; // Month as a number (1-12)
    const year = start.getUTCFullYear();
    try {
         
        // Update the current SpecialBonus to inactive
        const activeRewardPoint = await prisma.rewardPoint.findFirst({
            where: { isFinalize: true }
        });
        if (activeRewardPoint) {
            await prisma.rewardPoint.update({
                where: { id: activeRewardPoint.id },
                data: {
                    isFinalize: false
                },
            });
        }
        // Duplicate the RewardPoint
        const newRewardPoint = await prisma.rewardPoint.create({
            data: {
                month: month,
                year: year,
                resetDate: null,
                isFinalize: true,
                expenses: 10000,
                point: 1
            },
        });

        console.log('Duplicated RewardPoint:', newRewardPoint);
    } catch (error) {
        console.error('Error in duplicating RewardPoint:', error);
    }
}
createRewardPoint().catch(console.error)
