import axios from 'axios'
import { parseStringPromise } from 'xml2js'
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

const fetchProductGroups = async () => {
  try {
    logger.info(`Processing ProductGroup`);
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
      const productGroupsdb = await prisma.productGroup.findUnique({ where: { name: product.ProductGroup[0] } });
      console.error("product.ProductGroup[0]", product.ProductGroup[0])
      if (product.ProductGroup[0] === "BRAKE LINE") {
        console.log("product.ProductGroup[0]", product.ProductGroup[0])
        console.log(productGroupsdb)
      }

      if (!productGroupsdb && product.ProductGroup[0]) {
        await prisma.productGroup.create({
          data: {
            name: product.ProductGroup[0]
          }
        })
      }
    }
  } catch (error) {
    console.error('An error occurred:', error)
  }
}

fetchProductGroups().catch(console.error)
