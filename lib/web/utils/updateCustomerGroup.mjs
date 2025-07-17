import axios from 'axios';
import { parseStringPromise } from 'xml2js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const SOAP_HEADERS = {
  'SOAPACTION': 'MasterCustomerList',
  'Content-Type': 'application/xml',
  'Authorization': 'Basic QURNMDFAY21jLmNvbTpDb21wbW90bzkq'
};

const SOAP_REQUEST_BODY = `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:wsc="urn:microsoft-dynamics-schemas/codeunit/WSIntegration">
  <soapenv:Header/>
  <soapenv:Body>
    <wsc:MasterCustomerList>
      <wsc:p_oCustomers></wsc:p_oCustomers>
    </wsc:MasterCustomerList>
  </soapenv:Body>
</soapenv:Envelope>`;

async function updateUserCustomerGroup(user) {
    const custGroupName = user?.DescriptionPriceGroup?.[0];
    const custNo = user?.CustNo[0];
    if (!custGroupName || !custNo) {
      console.log('Skipping user with missing data:');
      return;
    }

  try {
    let customerGroup = await prisma.customerGroup.findFirst({ where: { name: custGroupName } });

    if (!customerGroup) {
      customerGroup = await prisma.customerGroup.create({ data: { name: custGroupName } });
    }

    await prisma.user.update({
        where: { custNo },
        data: {
          customerGroup: {
            connect: { id: customerGroup.id }
          }
        }
      });

  } catch (error) {
    if (error.code === 'P2025') {
      console.error(`User with CustNo ${custNo} not found`);
    } else {
      console.error('Unexpected error:', error);
    }
  }
}

const updateCustomerGroup = async () => {
    
  try {
    const { data: xmlData } = await axios({
      method: 'get',
      url: process.env.NAV_URL,
      headers: SOAP_HEADERS,
      data: SOAP_REQUEST_BODY
    });

    const result = await parseStringPromise(xmlData);
    const users = result['Soap:Envelope']['Soap:Body'][0]['MasterCustomerList_Result'][0]['p_oCustomers'][0]['PT_CustomerInfo'];
    for (const user of users) {
      await updateUserCustomerGroup(user);
    }

  } catch (error) {
    console.error('Failed to update customer groups:', error);
  }
};

updateCustomerGroup().catch(console.error);
