import axios from 'axios';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const NAV_URL = process.env.NAV_URL;
const COMPANY_ID = process.env.COMPANY_ID;
const NAV_BASIC_AUTH = process.env.NAV_BASIC_AUTH;

if (!NAV_URL) throw new Error('Missing NAV_URL in .env');
if (!COMPANY_ID) throw new Error('Missing COMPANY_ID in .env');
if (!NAV_BASIC_AUTH) throw new Error('Missing NAV_BASIC_AUTH in .env');

const fetchProductGroups = async () => {
  try {
    console.log('=== Start Fetch ProductGroups ===');
    const pageSize = 100;
    let skip = 0;
    let totalFetched = 0;
    let totalInserted = 0;

    while (true) {
      console.log(`Fetching page: skip=${skip} ...`);
      const url = `${NAV_URL}/companies(${COMPANY_ID})/api_MasterProductLists?$top=${pageSize}&$skip=${skip}`;

      const response = await axios.get(url, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `${NAV_BASIC_AUTH}`, // หรือ `Basic ${NAV_BASIC_AUTH}` ถ้า .env เก็บแค่ base64
        },
      });

      const products = response.data?.value ?? [];

      const count = products.length;
      totalFetched += count;
      console.log(`✓ Received ${count} items from NAV`);

      if (!products.length) {
        console.log('No more products — ending loop');
        break;
      }

      // ดึงชื่อ ProductGroup ไม่ซ้ำใน page นี้
      const productGroupNames = Array.from(
        new Set(
          products
            .map((p) =>
              p.ProductGroup ? String(p.ProductGroup).trim() : '',
            )
            .filter((name) => !!name),
        ),
      );

      // debug case เดิม "BRAKE LINE"
      if (productGroupNames.includes('BRAKE LINE')) {
        console.log('Found ProductGroup BRAKE LINE in this page');
      }

      if (productGroupNames.length > 0) {
        // หา ProductGroup ที่มีอยู่แล้วใน DB
        const existingGroups = await prisma.productGroup.findMany({
          where: { name: { in: productGroupNames } },
          select: { name: true },
        });

        const existingSet = new Set(existingGroups.map((g) => g.name));

        // เอาเฉพาะชื่อที่ยังไม่มีใน DB
        const missingNames = productGroupNames.filter(
          (name) => !existingSet.has(name),
        );
        console.log(
          `Found ${productGroupNames.length} unique productGroups in this page — ${missingNames.length} new`,
        );

        if (missingNames.length > 0) {
          const result = await prisma.productGroup.createMany({
            data: missingNames.map((name) => ({ name })),
            skipDuplicates: true,
          });

          totalInserted += result.count;
          console.log(`✓ Inserted ${result.count} new productGroup into DB`);
        }
      }

      // ไปหน้า next
      skip += pageSize;
      if (products.length < pageSize) {
        console.log('Reached last partial page — stopping...');
        break;
      }
    }

    console.log('=== Fetch productGroup Completed ===');
    console.log(`Total fetched from NAV: ${totalFetched}`);
    console.log(`Total inserted into DB: ${totalInserted}`);
  } catch (error) {
    console.error('An error occurred while fetching product groups:', error);
  } finally {
    await prisma.$disconnect();
  }
};

fetchProductGroups().catch(console.error);
