import axios from 'axios'
import { parseStringPromise } from 'xml2js'
import bcrypt from 'bcrypt'
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

const fetchUsers = async () => {
    try {
        const response = await axios({
            method: 'get',
            url: 'http://49.0.64.73:9147/BC200/WS/Comp%20Test/Codeunit/WSIntegration',
            headers: {
                'SOAPACTION': 'ReportSalesInvoiceDetail',
                'Content-Type': 'application/xml',
                'Authorization': 'Basic QURNMDFAY21jLmNvbTpDb21wbW90bzkq'
            },
            data: `<?xml version="1.0" encoding="UTF-8"?> 
            <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" 
            xmlns:wsc="urn:microsoft-dynamics-schemas/codeunit/WSIntegration"> 
            <soapenv:Header/> 
            <soapenv:Body> 
                <wsc:ReportSalesInvoiceDetail> 
                    <wsc:p_gFromDate>2024-08-01</wsc:p_gFromDate> 
                    <wsc:p_gToDate>2024-08-31</wsc:p_gToDate> 
                    <wsc:p_gFromCustNo></wsc:p_gFromCustNo> 
                    <wsc:p_gToCustNo></wsc:p_gToCustNo> 
                    <wsc:p_gBrand></wsc:p_gBrand> 
                    <wsc:p_gInvoiceNo></wsc:p_gInvoiceNo>
                    <wsc:p_oSales></wsc:p_oSales> 
                </wsc:ReportSalesInvoiceDetail>        
            </soapenv:Body> 
            </soapenv:Envelope>`
        })

        const result = await parseStringPromise(response.data)
        const users = result['Soap:Envelope']['Soap:Body'][0]['ReportSalesInvoiceDetail_Result'][0]['p_oSales'][0]['PT_SalesInfo']


    } catch (error) {
        console.error('An error occurred:', error)
    }
}

fetchUsers().catch(console.error)
