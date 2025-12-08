import axios from 'axios';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const NAV_URL = process.env.NAV_URL;
const COMPANY_ID = process.env.COMPANY_ID;
const NAV_BASIC_AUTH = process.env.NAV_BASIC_AUTH;

if (!NAV_URL) throw new Error('Missing NAV_URL in .env');
if (!COMPANY_ID) throw new Error('Missing COMPANY_ID in .env');
if (!NAV_BASIC_AUTH) throw new Error('Missing NAV_BASIC_AUTH in .env');

const fetchComrates = async () => {
  try {
    console.log('=== Start Fetch Comrates ===');
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

      // ดึงชื่อ ComRate ไม่ซ้ำใน page นี้
      const comRateNames = Array.from(
        new Set(
          products
            .map((p) => (p.ComRate ? String(p.ComRate).trim() : ''))
            .filter((name) => !!name),
        ),
      );

      if (comRateNames.length > 0) {
        // หา comRate ที่มีอยู่แล้วใน DB
        const existingComRates = await prisma.comRate.findMany({
          where: { name: { in: comRateNames } },
          select: { name: true },
        });

        const existingSet = new Set(existingComRates.map((c) => c.name));

        // เอาเฉพาะชื่อที่ยังไม่มีใน DB
        const missingNames = comRateNames.filter(
          (name) => !existingSet.has(name),
        );
        console.log(
          `Found ${comRateNames.length} unique comRates in this page — ${missingNames.length} new`,
        );

        if (missingNames.length > 0) {
          const result = await prisma.comRate.createMany({
            data: missingNames.map((name) => ({ name })),
            skipDuplicates: true,
          });

          totalInserted += result.count;
          console.log(`✓ Inserted ${result.count} new comRate into DB`);
        }
      }

      // ไป page ถัดไป
      skip += pageSize;
      if (products.length < pageSize) {
        console.log('Reached last partial page — stopping...');
        break;
      }
    }

    console.log('=== Fetch comRate Completed ===');
    console.log(`Total fetched from NAV: ${totalFetched}`);
    console.log(`Total inserted into DB: ${totalInserted}`);
  } catch (error) {
    console.error('An error occurred while fetching comRates:', error);
  } finally {
    await prisma.$disconnect();
  }
};

fetchComrates().catch(console.error);
