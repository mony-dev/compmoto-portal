import axios from 'axios'
import { parseStringPromise } from 'xml2js'
import bcrypt from 'bcrypt'
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

const fetchComrates = async () => {
  try {
    const response = await axios({
      method: 'get',
      url: process.env.NAV_URL,
      headers: {
        'SOAPACTION': 'MasterProductList',
        'Content-Type': 'application/xml',
        'Authorization': 'Basic QURNMDFAY21jLmNvbTpDb21wbW90bzkq'
      },
      data: `<?xml version="1.0" encoding="UTF-8"?>
        <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:wsc="urn:microsoft-dynamics-schemas/codeunit/WSIntegration">
          <soapenv:Header/>
          <soapenv:Body>
            <wsc:MasterProductList>
                <wsc:p_oItems></wsc:p_oItems>
            </wsc:MasterProductList>
          </soapenv:Body>
        </soapenv:Envelope>`
    })

    const result = await parseStringPromise(response.data)
    const products = result['Soap:Envelope']['Soap:Body'][0]['MasterProductList_Result'][0]['p_oItems'][0]['PT_ItemInfo']

    for (let product of products) {
      const comRatedb = await prisma.comRate.findUnique({ where: { name: product.ComRate[0] } });
      if (!comRatedb && product.ComRate[0]) {
        await prisma.comRate.create({
          data: {
            name: product.ComRate[0]
          }
        })
      }
    }
  } catch (error) {
    console.error('An error occurred:', error)
  }
}

fetchComrates().catch(console.error)
