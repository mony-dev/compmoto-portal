import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

const createRewardPoint = async () => {
    const start = new Date();
    const month = start.getUTCMonth() + 1; // Month as a number (1-12)
    const year = start.getUTCFullYear();
    try {
       
        // Duplicate the RewardPoint
        const newRewardPoint = await prisma.rewardPoint.create({
            data: {
                month: month,
                year: year,
                resetDate: null,
                isFinalize: false,
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
