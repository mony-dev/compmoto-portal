import axios from 'axios'
import { parseStringPromise } from 'xml2js'
import bcrypt from 'bcrypt'
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

const fetchSale = async () => {
  try {

    const users = [
      {
        email: 'T3@cmc.com',
        name: 'T3',
        role: 'SALE',
        custNo: 'T3',
        status: 'Active'
      },
      {
        email: 'T7@cmc.com',
        name: 'T7',
        role: 'SALE',
        custNo: 'T7',
        status: 'Active'
      },
      {
        email: 'T10@cmc.com',
        name: 'T10',
        role: 'SALE',
        custNo: 'T10',
        status: 'Active'
      },
      {
        email: 'T12@cmc.com',
        name: 'T12',
        role: 'SALE',
        custNo: 'T12',
        status: 'Active'
      },
      {
        email: 'T6@cmc.com',
        name: 'T6',
        role: 'SALE',
        custNo: 'T6',
        status: 'Active'
      },
      {
        email: 'T8@cmc.com',
        name: 'T8',
        role: 'SALE',
        custNo: 'T8',
        status: 'Active'
      },
      {
        email: 'T9@cmc.com',
        name: 'T9',
        role: 'SALE',
        custNo: 'T9',
        status: 'Active'
      },
      {
        email: 'T11@cmc.com',
        name: 'T11',
        role: 'SALE',
        custNo: 'T11',
        status: 'Active'
      },
      {
        email: 'T18@cmc.com',
        name: 'T18',
        role: 'SALE',
        custNo: 'T18',
        status: 'Active'
      },
      {
        email: 'T22@cmc.com',
        name: 'T22',
        role: 'SALE',
        custNo: 'T22',
        status: 'Active'
      },

    ]

    for (let user of users) {
      const hashedPassword = await bcrypt.hash('P@ssw0rd', 10) // replace 'password' with actual password
      await prisma.user.create({
        data: {
          email: user.email,
          name: user.name,
          role: user.role,
          encryptedPassword: hashedPassword,
          rewardPoint: 300,
          custNo: user.custNo,
          status: user.status
        }
      })
    }
  } catch (error) {
    console.error('An error occurred:', error)
  }
}

fetchSale().catch(console.error)