import axios from 'axios'
import { parseStringPromise } from 'xml2js'
import bcrypt from 'bcrypt'
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

const fetchBrands = async () => {
  try {
    const response = await axios({
      method: 'get',
      url: 'http://49.0.64.73:9147/BC200/WS/Comp%20Test/Codeunit/WSIntegration',
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
      const productCode = product.ItemNo[0];
      const productName = product.ItemName[0];
      const brandsdb = await prisma.brand.findUnique({ where: { name: product.Brand[0] } });
      if (!product.Brand[0]) {
        console.error(`Brand is null for ${productName} (${productCode})`);
        continue;
      }
      if (!brandsdb && product.Brand[0]) {
        await prisma.brand.create({
          data: {
            name: product.Brand[0]
          }
        })
      } 
    }
  } catch (error) {
    console.error('An error occurred:', error)
  }
}

fetchBrands().catch(console.error)
