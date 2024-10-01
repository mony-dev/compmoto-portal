import axios from 'axios'
import { parseStringPromise } from 'xml2js'
import bcrypt from 'bcrypt'
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

const fetchAdmin = async () => {
  try {

    const users = [
        {
            email: 'gift@compmoto.com',
            name: 'Gift',
            role: 'ADMIN',
            custNo: 'A0010'
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
            rewardPoint: 300,
            custNo: user.custNo
          }
        })
    }
  } catch (error) {
    console.error('An error occurred:', error)
  }
}

fetchAdmin().catch(console.error)
