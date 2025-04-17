import axios from 'axios';
import { parseStringPromise } from 'xml2js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const updateLot = async () => {
  try {
    const products = await prisma.product.findMany();

    for (let product of products) {
      const response = await axios({
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
              <wsc:p_gItem>${product.code}</wsc:p_gItem>  
              <wsc:p_oItems></wsc:p_oItems>
              </wsc:MasterItemByLot>
          </soapenv:Body>
          </soapenv:Envelope>`
      });

      const parsedResponse = await parseStringPromise(response.data);
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

      await prisma.product.update({
        where: { id: product.id },
        data: { years: JSON.stringify(years) }
      });

      console.log(`Updated product ${product.id} with years:`, years);
    }
  } catch (error) {
    console.error('An error occurred:', error);
  }
};

updateLot().catch(console.error);
