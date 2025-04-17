import axios from 'axios';
import { parseStringPromise } from 'xml2js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const fetchProducts = async () => {
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
      const ItemImage = product.ItemImage[0];
      const ItemImageUrl = ItemImage ? `https://${ItemImage}` : ''

      if (!brandId) {
        console.error(`Brand not found for product ${productName} (${productCode})`);
        continue;
      }
      const existingProduct = await prisma.product.findUnique({ where: { code: productCode } });

      if (showInPortal === "Yes" && !existingProduct) {
        const lotResponse = await axios({
          method: 'get',
          url: process.env.NAV_URL,
          headers: {
            'SOAPACTION': 'MasterItemByLot',
            'Content-Type': 'application/xml',
            'Authorization': 'Basic QURNMDFAY21jLmNvbTpDb21wbW90bzkq'
          },
          data: `<?xml version="1.0" encoding="UTF-8"?>
            <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:wsc="urn:microsoft-dynamics-schemas/codeunit/WSIntegration">
            <soapenv:Header/>
            <soapenv:Body>
                <wsc:MasterItemByLot>         
                <wsc:p_gItem>${productCode}</wsc:p_gItem>  
                <wsc:p_oItems></wsc:p_oItems>
                </wsc:MasterItemByLot>
            </soapenv:Body>
            </soapenv:Envelope>`
        });

        const parsedResponse = await parseStringPromise(lotResponse.data);
        const items = parsedResponse['Soap:Envelope']['Soap:Body'][0]['MasterItemByLot_Result'][0]['p_oItems'][0]['p_ItemByLotinfo'];

        const years = [
          { year: "2019", discount: 0, isActive: false, isDisable: true },
          { year: "2020", discount: 0, isActive: false, isDisable: true },
          { year: "2021", discount: 0, isActive: false, isDisable: true },
          { year: "2022", discount: 0, isActive: false, isDisable: true },
          { year: "2023", discount: 0, isActive: false, isDisable: true },
          { year: "2024", discount: 0, isActive: false, isDisable: true }
        ];

        items.forEach(item => {
          const lotNo = item['LotNo'][0];
  
          // Check for specific letters in LotNo
          if (lotNo.includes('G')) {
              years[0].isActive = true;
              years[0].isDisable = false;
          } 
          if (lotNo.includes('H')) {
              years[1].isActive = true;
              years[1].isDisable = false;
          }
          if (lotNo.includes('I')) {
              years[2].isActive = true;
              years[2].isDisable = false;
          } 
          if (lotNo.includes('J')) {
              years[3].isActive = true;
              years[3].isDisable = false;
          }
          if (lotNo.includes('K')) {
              years[4].isActive = true;
              years[4].isDisable = false;
          }
          // Additional condition: check for exact numbers in LotNo
          if (lotNo.includes('19')) {
              years[0].isActive = true;
              years[0].isDisable = false;
          }
          if (lotNo.includes('20')) {
              years[1].isActive = true;
              years[1].isDisable = false;
          }
          if (lotNo.includes('21')) {
              years[2].isActive = true;
              years[2].isDisable = false;
          }
          if (lotNo.includes('22')) {
              years[3].isActive = true;
              years[3].isDisable = false;
          }
          if (lotNo.includes('23')) {
              years[4].isActive = true;
              years[4].isDisable = false;
          }
        });

        await prisma.product.create({
          data: {
            code: productCode,
            name: productName,
            brandId: brandId,
            price: productPrice,
            navStock: productInventory,
            portalStock: productInventory,
            years: JSON.stringify(years),
            image: ItemImageUrl
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
