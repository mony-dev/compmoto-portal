import axios from 'axios';
import { parseStringPromise } from 'xml2js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const updateAdmin = async () => {
    try {

        const userdb = await prisma.user.findMany({
            where: {
                role: 'ADMIN'
            }
        })

        let no = 0;
        for (let user of userdb) {
            no = no + 1
            const updatedUser = await prisma.user.update({
                where: {
                    email: user.email,
                },
                data: {
                    custNo: `A-000${no}`,
                },
            }).catch((error) => {
                
            });
        }
    } catch (error) {
        console.error('An error occurred:', error);
    }
};

updateAdmin().catch(console.error);
