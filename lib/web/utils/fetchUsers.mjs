import axios from 'axios'
import { parseStringPromise } from 'xml2js'
import bcrypt from 'bcrypt'
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

const fetchUsers = async () => {
  try {
    const response = await axios({
      method: 'get',
      url: process.env.NAV_URL,
      headers: {
        'SOAPACTION': 'MasterCustomerList',
        'Content-Type': 'application/xml',
        'Authorization': 'Basic QURNMDFAY21jLmNvbTpDb21wbW90bzkq'
      },
      data: `<?xml version="1.0" encoding="UTF-8"?>
        <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:wsc="urn:microsoft-dynamics-schemas/codeunit/WSIntegration">
          <soapenv:Header/>
          <soapenv:Body>
            <wsc:MasterCustomerList>
              <wsc:p_oCustomers></wsc:p_oCustomers>
            </wsc:MasterCustomerList>
          </soapenv:Body>
        </soapenv:Envelope>`
    })

    const result = await parseStringPromise(response.data)
    const users = result['Soap:Envelope']['Soap:Body'][0]['MasterCustomerList_Result'][0]['p_oCustomers'][0]['PT_CustomerInfo']

    for (let user of users) {
      const hashedPassword = await bcrypt.hash('password', 10) // replace 'password' with actual password
      const userdb = await prisma.user.findUnique({ where: { email: `${user.CustNo[0]}@compmoto.com` } });
      const custGroupName = user?.DescriptionPriceGroup?.[0];

      let customerGroup = await prisma.customerGroup.findFirst({ where: { name: custGroupName } });

      if (!customerGroup) {
        customerGroup = await prisma.customerGroup.create({ data: { name: custGroupName } });
      }

      if (user.DescriptionPriceGroup[0] && !userdb) {
        if (user.DescriptionPriceGroup[0])
        await prisma.user.create({
          data: {
            email:`${user.CustNo[0]}@compmoto.com`,
            name: user.CustName[0],
            paymentTerms: user.PaymentTerms[0],
            creditPoint: parseInt(user.CreditPoint[0]),
            phoneNumber: user.PhoneNo[0],
            gender: user.Gender[0],
            vatNo: user.VATNo[0],
            custAddress: user.CustAddress[0],
            shipToAddress: user.ShipToAddress[0],
            balanceLCY: parseInt(user.BalanceLCY[0]),
            contactName: user.ContactName[0],
            encryptedPassword: hashedPassword,
            role: 'USER',
            custPriceGroup: user.CustPriceGroup[0],
            custNo: user.CustNo[0],
            rewardPoint: 0,
            customerGroupId: customerGroup.id
          }
        })
      }
    }
  } catch (error) {
    console.error('An error occurred:', error)
  }
  finally {
    await prisma.$disconnect()
  }
}

fetchUsers().catch(console.error)
