import axios from 'axios';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const NAV_URL = process.env.NAV_URL;
const COMPANY_ID = process.env.COMPANY_ID;
const NAV_BASIC_AUTH = process.env.NAV_BASIC_AUTH;

if (!NAV_URL) throw new Error('Missing NAV_URL in .env');
if (!COMPANY_ID) throw new Error('Missing COMPANY_ID in .env');
if (!NAV_BASIC_AUTH) throw new Error('Missing NAV_BASIC_AUTH in .env');

// Format date -> YYYY-MM-DD
const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const stringToFloat = (val) => {
  if (!val) return 0;
  return parseFloat(String(val).replace(/,/g, ''));
};

const fetchInvoice = async () => {
  try {
    console.log('=== Start Fetch Invoice ===');

    // ช่วงวันที่
    const today = new Date();
    const formattedToday = formatDate(today);
    const fromDate = '2025-01-01'; // จะปรับเป็น ENV ก็ได้

    console.log(`Date range: ${fromDate} → ${formattedToday}`);

    const pageSize = 100;
    let skip = 0;
    let totalFetched = 0;
    let totalCreated = 0;
    let totalSkippedExists = 0;

    while (true) {
      console.log(`Fetching invoice page: skip=${skip} ...`);

      const url =
        `${NAV_URL}/companies(${COMPANY_ID})/api_ReportSalesInvoiceDetails` +
        `?$top=${pageSize}&$skip=${skip}`;

      // ตาม curl: ใช้ form fields (แต่เราจะส่งแบบ JSON body ตรง ๆ)
      const payload = {
        StartDateFilter: fromDate,
        EndDateFilter: formattedToday,
        CustNo: '',
        InvoiceNo: '',
      };

      let response;
      try {
        response = await axios.post(url, payload, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `${NAV_BASIC_AUTH}`,
          },
        });
      } catch (err) {
        console.error('❌ NAV ReportSalesInvoiceDetails request failed:', err.message);
        break;
      }

      const invoices = response.data?.value ?? [];
      const count = invoices.length;
      totalFetched += count;

      console.log(`✓ Received ${count} invoices from NAV`);

      if (!invoices.length) {
        console.log('No more invoices from NAV — stopping.');
        break;
      }

      // ---------- loop ราย invoice ----------
      for (const invoice of invoices) {
        const invoiceNo = invoice.InvoiceNo
          ? String(invoice.InvoiceNo).trim()
          : null;
        const postingDateStr = invoice.PostingDate || invoice.PostingDateFilter;
        const postingDate = postingDateStr ? new Date(postingDateStr) : null;
        const totalAmount = stringToFloat(invoice.TotalAmount);
        const custNo = invoice.CustNo ? String(invoice.CustNo).trim() : null;
        const externalDocument = invoice.ExternalDoc
          ? String(invoice.ExternalDoc).trim()
          : null;

        if (!invoiceNo || !postingDate || !custNo) {
          console.warn(
            `⚠ Missing required data (invoiceNo/postingDate/custNo), skipping invoice.`,
          );
          continue;
        }

        // เช็คว่ามี invoice นี้แล้วหรือยัง
        const existingInvoice = await prisma.invoice.findFirst({
          where: { documentNo: invoiceNo },
        });

        if (existingInvoice) {
          totalSkippedExists++;
          console.log(`• Invoice ${invoiceNo} already exists → skipping.`);
          continue;
        }

        console.log(`→ Creating new invoice ${invoiceNo} (custNo=${custNo})`);

        // ---------- ดึงรายละเอียด invoice (บรรทัดสินค้า) ----------
        let salesInfo;
        try {
          const filter = encodeURIComponent(`SalesNo eq '${invoiceNo}'`);
          const detailUrl =
            `${NAV_URL}/companies(${COMPANY_ID})/api_MasterSalesInvoices` +
            `?$expand=api_MasterSalesInvoiceLines&$filter=${filter}`;

          const detailResponse = await axios.get(detailUrl, {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `${NAV_BASIC_AUTH}`,
            },
          });

          const rows = detailResponse.data?.value ?? [];
          if (!rows.length) {
            console.warn(`⚠ No detail found for invoice ${invoiceNo}, skipping.`);
            continue;
          }

          salesInfo = rows[0];
        } catch (err) {
          console.error(
            `❌ Failed to fetch invoice detail for ${invoiceNo}:`,
            err.message,
          );
          continue;
        }

        // หา user จาก custNo
        const user = await prisma.user.findFirst({
          where: { custNo },
        });

        if (!user) {
          console.error(`User with customer number ${custNo} not found. Skipping invoice.`);
          continue;
        }

        const userId = user.id;

        // ดึง lineItems จาก expand: api_MasterSalesInvoiceLines
        const lineItems = Array.isArray(salesInfo.api_MasterSalesInvoiceLines)
          ? salesInfo.api_MasterSalesInvoiceLines
          : [];

        if (!lineItems.length) {
          console.warn(`⚠ No line items for invoice ${invoiceNo}, skipping.`);
          continue;
        }

        // ---------- คำนวณ qty, subTotal ----------
        let totalQty = 0;
        let subTotal = 0;

        for (const item of lineItems) {
          const qty = parseInt(item.Qty ?? item.Quantity ?? 0, 10);
          const lineAmount = stringToFloat(item.LineAmount);
          totalQty += qty;
          subTotal += lineAmount;
        }

        // ---------- สร้าง invoice ----------
        const newInvoice = await prisma.invoice.create({
          data: {
            userId,
            documentNo: invoiceNo,
            date: postingDate,
            totalPrice: totalAmount, // จะอัปเดตทีหลังด้วย discountPrice จริง
            subTotal,
            totalAmount: totalQty,
            groupDiscount: user.custPriceGroup === '5STARS' ? 5 : 7,
            externalDocument,
          },
        });

        console.log(
          `✓ Created invoice ${invoiceNo} with ${lineItems.length} items (qty=${totalQty}, subTotal=${subTotal})`,
        );

        // ---------- สร้าง / update invoice items ----------
        for (const item of lineItems) {
          const itemNo = item.ItemNo ? String(item.ItemNo).trim() : null;
          const qty = parseInt(item.Qty ?? item.Quantity ?? 0, 10);
          const lineAmount = stringToFloat(item.LineAmount);
          const lineDiscountPc = parseFloat(item.LineDiscountPc ?? 0);
          const discountPrice = parseFloat(item.LineAmtAfterDiscount ?? 0);

          if (!itemNo || qty <= 0) continue;

          const product = await prisma.product.findUnique({
            where: { code: itemNo },
          });

          if (!product) {
            console.error(`Product with item number ${itemNo} not found. Skipping item.`);
            continue;
          }

          const existingItem = await prisma.invoiceItem.findUnique({
            where: {
              invoiceId_productId: {
                invoiceId: newInvoice.id,
                productId: product.id,
              },
            },
          });

          if (existingItem) {
            await prisma.invoiceItem.update({
              where: {
                invoiceId_productId: {
                  invoiceId: newInvoice.id,
                  productId: product.id,
                },
              },
              data: {
                amount: existingItem.amount + qty,
                price: existingItem.price + (qty ? lineAmount / qty : 0),
                discountPrice: existingItem.discountPrice + discountPrice,
              },
            });
          } else {
            await prisma.invoiceItem.create({
              data: {
                invoiceId: newInvoice.id,
                productId: product.id,
                amount: qty,
                price: qty ? lineAmount / qty : 0,
                discount: lineDiscountPc,
                discountPrice,
              },
            });
          }
        }

        // ---------- รวม discountPrice ทั้ง invoice แล้วอัปเดต totalPrice ----------
        const sumOfDiscountPrices = await prisma.invoiceItem.aggregate({
          where: { invoiceId: newInvoice.id },
          _sum: {
            discountPrice: true,
          },
        });

        const finalTotalPrice = sumOfDiscountPrices._sum.discountPrice || 0;

        await prisma.invoice.update({
          where: { id: newInvoice.id },
          data: {
            totalPrice: finalTotalPrice,
          },
        });

        console.log(
          `→ Updated invoice ${invoiceNo} totalPrice to ${finalTotalPrice}`,
        );

        totalCreated++;
      }

      // next page
      skip += pageSize;
      if (invoices.length < pageSize) {
        console.log('Reached last partial page — stopping.');
        break;
      }
    }

    console.log('\n=== Fetch Invoice Completed ===');
    console.log(`Total fetched from NAV: ${totalFetched}`);
    console.log(`Total invoices created: ${totalCreated}`);
    console.log(`Total invoices skipped (already exists): ${totalSkippedExists}`);
  } catch (error) {
    console.error('❌ An error occurred in fetchInvoice:', error);
  } finally {
    await prisma.$disconnect();
  }
};

fetchInvoice().catch(console.error);
