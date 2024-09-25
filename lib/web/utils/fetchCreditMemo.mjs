import { PrismaClient } from '@prisma/client';
import axios from 'axios'
import { parseStringPromise } from 'xml2js'

const prisma = new PrismaClient();
const fetchCreditMemo = async () => {
    try {
      const users = await prisma.user.findMany({
        where: {
          role: {
            in: ["USER"], // This should be an array
          }
        }
      });
        console.log(users)
        for (const user of users) {
          const response = await axios({
              method: 'get',
              url: 'http://49.0.64.73:9147/BC200/WS/Comp%20Test/Codeunit/WSIntegration',
              headers: {
                'SOAPACTION': 'MasterPostedCreditMemoList',
                'Content-Type': 'application/xml',
                'Authorization': 'Basic QURNMDFAY21jLmNvbTpDb21wbW90bzkq'
              },
              data: `<?xml version="1.0" encoding="UTF-8"?>
                <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:wsc="urn:microsoft-dynamics-schemas/codeunit/WSIntegration">
                  <soapenv:Header/>
                  <soapenv:Body>
                    <wsc:MasterPostedCreditMemoList>
                        <wsc:p_gCustomer>${user.custNo}</wsc:p_gCustomer>     
                        <wsc:p_oSales></wsc:p_oSales>
                    </wsc:MasterPostedCreditMemoList>
                  </soapenv:Body>
                </soapenv:Envelope>`
            });
        
            const result = await parseStringPromise(response.data);
            const sales = result['Soap:Envelope']['Soap:Body'][0]['MasterPostedCreditMemoList_Result'][0]['p_oSales'][0]['PT_SalesInfo'];
        
            for (let sale of sales) {
              const salesNo = sale.SalesNo[0];
              const totalAmount = parseFloat(sale.TotalAmount[0])
              const amountIncludingVAT = parseFloat(sale.AmountIncludingVAT[0])
              
        
              if (!sale['PostDate'][0]) {
                console.error(`CN missing posted date`);
                continue;
              }

              const date =new Date(sale['PostDate'][0])

              const existingCn = await prisma.memoCredit.findFirst({ where: { documentNo: salesNo } });
        

              if (!existingCn) {
                await prisma.memoCredit.create({
                  data: {
                      userId: user.id,
                      documentNo: salesNo,
                      totalAmount: totalAmount,
                      amountIncludingVAT: amountIncludingVAT,
                      date: date,
                  }
                });
              } else if (existingCn) {
                await prisma.memoCredit.delete({ where: { documentNo: salesNo } });
              }
            }
        }
  
      } catch (error) {
        console.error('An error occurred:', error);
      }
};

fetchCreditMemo().catch(console.error);
