import axios from 'axios';
import { parseStringPromise } from 'xml2js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const fetchProducts = async () => {
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
    });

    const result = await parseStringPromise(response.data);
    const products = result['Soap:Envelope']['Soap:Body'][0]['MasterProductList_Result'][0]['p_oItems'][0]['PT_ItemInfo'];

    for (let product of products) {
      const productCode = product.ItemNo[0];
      const productName = product.ItemName[0];
      const brandName = product.Brand[0]; 
      const productPrice = parseFloat(product.Price[0]);
      const productInventory = parseInt(product.Inventory[0]);
      const showInPortal = product.ShowInPortal[0];
      const brand = await prisma.brand.findUnique({ where: { name: brandName } });
      const brandId = brand ? brand.id : null;

      if (!brandId) {
        console.error(`Brand not found for product ${productName} (${productCode})`);
        continue;
      }
      const existingProduct = await prisma.product.findUnique({ where: { code: productCode } });

      if (showInPortal === "Yes" && !existingProduct) {
        await prisma.product.create({
          data: {
            code: productCode,
            name: productName,
            brandId: brandId,
            price: productPrice,
            navStock: productInventory,
            portalStock: productInventory,
            years: JSON.stringify([
              { year: "2019", discount: 0, isActive: false },
              { year: "2020", discount: 0, isActive: false },
              { year: "2021", discount: 0, isActive: false },
              { year: "2022", discount: 0, isActive: false },
              { year: "2023", discount: 0, isActive: false },
              { year: "2024", discount: 0, isActive: false }
            ]),
            image: product.ItemImage[0]
          }
        });
      } else if (showInPortal === "No" && existingProduct) {
        await prisma.product.delete({ where: { code: productCode } });
      }
    }
  } catch (error) {
    console.error('An error occurred:', error);
  }
};

fetchProducts().catch(console.error);
