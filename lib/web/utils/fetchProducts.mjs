import axios from 'axios';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const NAV_URL = process.env.NAV_URL;
const COMPANY_ID = process.env.COMPANY_ID;
const NAV_BASIC_AUTH = process.env.NAV_BASIC_AUTH;

if (!NAV_URL) throw new Error('Missing NAV_URL in .env');
if (!COMPANY_ID) throw new Error('Missing COMPANY_ID in .env');
if (!NAV_BASIC_AUTH) throw new Error('Missing NAV_BASIC_AUTH in .env');

const fetchProducts = async () => {
  try {
    console.log('=== Start Fetch Products ===');

    const pageSize = 100;
    let skip = 0;
    let totalFetched = 0;
    let totalInserted = 0;
    let totalDeleted = 0;

    while (true) {
      console.log(`Fetching product page: skip=${skip} ...`);

      const url = `${NAV_URL}/companies(${COMPANY_ID})/api_MasterProductLists?$top=${pageSize}&$skip=${skip}`;

      const response = await axios.get(url, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `${NAV_BASIC_AUTH}`, // ถ้า .env เก็บเฉพาะ base64 ให้ใช้ `Basic ${NAV_BASIC_AUTH}`
        },
      });

      const products = response.data?.value ?? [];
      const count = products.length;
      totalFetched += count;

      console.log(`✓ Received ${count} products from NAV`);

      if (!products.length) {
        console.log('No more products — ending loop');
        break;
      }

      for (const product of products) {
        const productCode = product.ItemNo ? String(product.ItemNo).trim() : '';
        if (!productCode) {
          continue;
        }

        const productName = product.ItemName ? String(product.ItemName).trim() : '';
        const brandName = product.Brand ? String(product.Brand).trim() : '';
        const productPrice = Number(product.Price ?? 0);
        const productInventory = Number(product.Inventory ?? 0);
        const showInPortal = product.ShowInPortal
        const itemImage = product.ItemImage ? String(product.ItemImage).trim() : '';
        const itemImageUrl = itemImage ? `https://${itemImage}` : '';

        // หา brand
        let brandId = null;
        if (brandName) {
          const brand = await prisma.brand.findUnique({
            where: { name: brandName },
          });
          brandId = brand ? brand.id : null;
        }

        if (!brandId) {
          console.warn(
            `Brand not found for product ${productName} (${productCode}) — skipping`,
          );
          continue;
        }

        const existingProduct = await prisma.product.findUnique({
          where: { code: productCode },
        });

        // สร้าง product ใหม่เมื่อ ShowInPortal == "Yes" และยังไม่มีใน DB
        if (showInPortal && !existingProduct) {
          console.log(
            `→ Creating product ${productCode} - ${productName} (brand: ${brandName})`,
          );

          // เตรียม years default
          const years = [
            { year: '2019', discount: 0, isActive: false, isDisable: true },
            { year: '2020', discount: 0, isActive: false, isDisable: true },
            { year: '2021', discount: 0, isActive: false, isDisable: true },
            { year: '2022', discount: 0, isActive: false, isDisable: true },
            { year: '2023', discount: 0, isActive: false, isDisable: true },
            { year: '2024', discount: 0, isActive: false, isDisable: true },
          ];

          // ดึง Lot ข้อมูลจาก API ใหม่ (สมมติ endpoint เป็น api_MasterItemByLots + filter)
          try {
            const filter = encodeURIComponent(`ItemNo eq '${productCode}'`);
            const lotUrl = `${NAV_URL}/companies(${COMPANY_ID})/api_MasterItemByLots?$filter=${filter}`;

            const lotResponse = await axios.get(lotUrl, {
              headers: {
                'Content-Type': 'application/json',
                Authorization: `${NAV_BASIC_AUTH}`,
              },
            });

            const items = lotResponse.data?.value ?? [];
            console.log(
              `   Lot info: received ${items.length} lots for ${productCode}`,
            );

            items.forEach((item) => {
              const lotNo = item.LotNo ? String(item.LotNo) : '';

              if (!lotNo) return;

              // Logic เดิม: map letter/number → year flags
              if (lotNo.includes('G') || lotNo.includes('19')) {
                years[0].isActive = true;
                years[0].isDisable = false;
              }
              if (lotNo.includes('H') || lotNo.includes('20')) {
                years[1].isActive = true;
                years[1].isDisable = false;
              }
              if (lotNo.includes('I') || lotNo.includes('21')) {
                years[2].isActive = true;
                years[2].isDisable = false;
              }
              if (lotNo.includes('J') || lotNo.includes('22')) {
                years[3].isActive = true;
                years[3].isDisable = false;
              }
              if (lotNo.includes('K') || lotNo.includes('23')) {
                years[4].isActive = true;
                years[4].isDisable = false;
              }
              // ปี 2024 ยังไม่มี mapping letter/number ตาม logic เดิม
            });
          } catch (err) {
            console.error(
              `   Error fetching lot info for product ${productCode}:`,
              err,
            );
          }

          await prisma.product.create({
            data: {
              code: productCode,
              name: productName,
              brandId: brandId,
              price: productPrice,
              navStock: productInventory,
              portalStock: productInventory,
              years: JSON.stringify(years),
              image: itemImageUrl,
            },
          });

          totalInserted += 1;
        } else if (!showInPortal && existingProduct) {
          console.log(
            `→ Deleting product ${productCode} - ${productName} (ShowInPortal = No)`,
          );
          await prisma.product.delete({ where: { code: productCode } });
          totalDeleted += 1;
        }
      }

      skip += pageSize;
      if (products.length < pageSize) {
        console.log('Reached last partial page — stopping...');
        break;
      }
    }

    console.log('=== Fetch Products Completed ===');
    console.log(`Total fetched from NAV: ${totalFetched}`);
    console.log(`Total inserted into DB: ${totalInserted}`);
    console.log(`Total deleted from DB: ${totalDeleted}`);
  } catch (error) {
    console.error('An error occurred while fetching products:', error);
  } finally {
    await prisma.$disconnect();
  }
};

fetchProducts().catch(console.error);
