import axios from 'axios';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const NAV_URL = process.env.NAV_URL;
const COMPANY_ID = process.env.COMPANY_ID;
const NAV_BASIC_AUTH = process.env.NAV_BASIC_AUTH;

if (!NAV_URL) throw new Error('Missing NAV_URL in .env');
if (!COMPANY_ID) throw new Error('Missing COMPANY_ID in .env');
if (!NAV_BASIC_AUTH) throw new Error('Missing NAV_BASIC_AUTH in .env');

const fetchFamily = async () => {
  try {
    console.log('=== Start Fetch Family ===');

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

      // Unique Family names in this page
      const familyNames = Array.from(
        new Set(
          products
            .map((p) => (p.Family ? String(p.Family).trim() : ''))
            .filter((name) => !!name),
        ),
      );

      console.log(`Found ${familyNames.length} unique families in this page`);

      if (familyNames.length > 0) {
        const existingFamilies = await prisma.family.findMany({
          where: { name: { in: familyNames } },
          select: { name: true },
        });

        const existingSet = new Set(existingFamilies.map((r) => r.name));
        const missingNames = familyNames.filter(
          (name) => !existingSet.has(name),
        );

        console.log(`→ ${missingNames.length} families are new`);

        if (missingNames.length > 0) {
          const result = await prisma.family.createMany({
            data: missingNames.map((name) => ({ name })),
            skipDuplicates: true,
          });

          totalInserted += result.count;
          console.log(`✓ Inserted ${result.count} new families into DB`);
        }
      }

      skip += pageSize;
      if (products.length < pageSize) {
        console.log('Reached last partial page — stopping...');
        break;
      }
    }
    console.log('=== Fetch Family Completed ===');
    console.log(`Total fetched from NAV: ${totalFetched}`);
    console.log(`Total inserted into DB: ${totalInserted}`);
  } catch (error) {
    console.error('An error occurred while fetching families:', error);
  } finally {
    await prisma.$disconnect();
  }
};

fetchFamily().catch(console.error);
