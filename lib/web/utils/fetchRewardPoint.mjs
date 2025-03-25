import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

const fetchRewardPoint = async () => {
    const start = new Date();
    const month = start.getUTCMonth() + 1; // Month as a number (1-12)
    const year = start.getUTCFullYear();
    try {
        // Find the current RewardPoint
        const currentRewardPoint = await prisma.rewardPoint.findFirst({
            where: { month: month - 1, year: year - 1 },
            include: {
                rewardPointHistories: true,
            },
        });

        if (!currentRewardPoint) return;
            // Duplicate the RewardPoint
            const newRewardPoint = await prisma.rewardPoint.create({
                data: {
                    month: month,
                    year: year,
                    resetDate: null,
                    isFinalize: false,
                    expenses: currentRewardPoint.expenses,
                    point: currentRewardPoint.point
                },
            });

            console.log('Duplicated RewardPoint:', newRewardPoint);
    } catch (error) {
        console.error('Error in duplicating RewardPoint:', error);
    }
}
fetchRewardPoint().catch(console.error)
