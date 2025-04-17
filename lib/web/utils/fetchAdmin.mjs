import bcrypt from 'bcrypt'
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

const fetchAdmin = async () => {
  try {

    const users = [
        {
            email: 'admin@compmoto.com',
            name: 'Admin',
            role: 'ADMIN',
            custNo: 'A0001'
        },
    ]

    for (let user of users) {
        const hashedPassword = await bcrypt.hash('password', 10) // replace 'password' with actual password
        await prisma.user.create({
          data: {
            email: user.email,
            name: user.name,
            role: user.role,
            encryptedPassword: hashedPassword,
            rewardPoint: 0,
            custNo: user.custNo
          }
        })
    }
  } catch (error) {
    console.error('An error occurred:', error)
  }
}

fetchAdmin().catch(console.error)
