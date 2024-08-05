import axios from 'axios'
import { parseStringPromise } from 'xml2js'
import bcrypt from 'bcrypt'
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

const fetchUsers = async () => {
  try {
    const response = await axios({
      method: 'get',
      url: 'http://49.0.64.73:9147/BC200/WS/Comp%20Moto/Codeunit/WSIntegration',
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
      if (user.CustPriceGroup[0] && !userdb) {
        if (user.CustPriceGroup[0] === '5STARS' || user.CustPriceGroup[0] === '7STARS')
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
            rewardPoint: 100
          }
        })
      }
    }
  } catch (error) {
    console.error('An error occurred:', error)
  }
}

fetchUsers().catch(console.error)
