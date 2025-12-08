import axios from 'axios';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const NAV_URL = process.env.NAV_URL;
const COMPANY_ID = process.env.COMPANY_ID;
const NAV_BASIC_AUTH = process.env.NAV_BASIC_AUTH;

if (!NAV_URL) throw new Error('Missing NAV_URL in .env');
if (!COMPANY_ID) throw new Error('Missing COMPANY_ID in .env');
if (!NAV_BASIC_AUTH) throw new Error('Missing NAV_BASIC_AUTH in .env');

const fetchBrands = async () => {
  try {
    console.log('=== Start Fetch Brands ===');
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
          Authorization: `${NAV_BASIC_AUTH}`,
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

      // ดึงชื่อ brand ไม่ซ้ำใน page นี้
      const brandNames = Array.from(
        new Set(
          products
            .map((p) => (p.Brand ? String(p.Brand).trim() : ''))
            .filter((name) => !!name),
        ),
      );

      if (brandNames.length === 0) {
        // ไม่มี brand ให้สร้าง ข้ามไป page ถัดไป
        skip += pageSize;
        if (products.length < pageSize) break;
        continue;
      }

      // หา brand ที่มีอยู่แล้วใน DB
      const existingBrands = await prisma.brand.findMany({
        where: { name: { in: brandNames } },
        select: { name: true },
      });

      const existingSet = new Set(existingBrands.map((b) => b.name));

      // หาเฉพาะชื่อที่ยังไม่มีใน DB
      const missingNames = brandNames.filter(
        (name) => !existingSet.has(name),
      );
      console.log(
        `Found ${brandNames.length} unique brands in this page — ${missingNames.length} new`,
      );

      if (missingNames.length > 0) {
        const result = await prisma.brand.createMany({
          data: missingNames.map((name) => ({ name })),
          skipDuplicates: true,
        });

        totalInserted += result.count;
        console.log(`✓ Inserted ${result.count} new brand into DB`);
      }

      // ไป page ถัดไป
      skip += pageSize;
      if (products.length < pageSize) {
        console.log('Reached last partial page — stopping...');
        break;
      }
    }

    console.log('=== Fetch brand Completed ===');
    console.log(`Total fetched from NAV: ${totalFetched}`);
    console.log(`Total inserted into DB: ${totalInserted}`);
  } catch (error) {
    console.error('An error occurred while fetching brands:', error);
  } finally {
    await prisma.$disconnect();
  }
};

fetchBrands().catch(console.error);
