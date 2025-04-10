import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const updatePoint = async () => {
  try {
    const users = await prisma.user.findMany();

    for (let user of users) {

      await prisma.user.update({
        where: { id: user.id },
        data: { rewardPoint: 0 }
      });

      console.log(`Updated user ${user.id} with 0 point:`);
    }
  } catch (error) {
    console.error('An error occurred:', error);
  }
};

updatePoint().catch(console.error);
