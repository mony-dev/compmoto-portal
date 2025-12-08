import axios from 'axios';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const NAV_URL = process.env.NAV_URL;
const COMPANY_ID = process.env.COMPANY_ID;
const NAV_BASIC_AUTH = process.env.NAV_BASIC_AUTH;

if (!NAV_URL) throw new Error('Missing NAV_URL in .env');
if (!COMPANY_ID) throw new Error('Missing COMPANY_ID in .env');
if (!NAV_BASIC_AUTH) throw new Error('Missing NAV_BASIC_AUTH in .env');

const updateProductImg = async () => {
  try {
    console.log('=== Start Update Product Images ===');

    const pageSize = 100;
    let skip = 0;
    let totalFetched = 0;
    let totalUpdated = 0;
    let totalNotFound = 0;

    while (true) {
      console.log(`Fetching NAV products page: skip=${skip} ...`);

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

      console.log(`✓ Received ${count} products`);

      if (!products.length) {
        console.log('No more NAV items — stopping fetch');
        break;
      }

      for (const product of products) {
        const productCode = product.ItemNo ? String(product.ItemNo).trim() : null;

        if (!productCode) continue;

        const rawImg = product.ItemImage ? String(product.ItemImage).trim() : '';
        const imageUrl = rawImg ? `https://${rawImg}` : '';

        console.log(`→ Updating image for ${productCode} → ${imageUrl}`);

        try {
          const updated = await prisma.product.update({
            where: { code: productCode },
            data: { image: imageUrl },
          });

          totalUpdated += 1;
        } catch (err) {
          if (err.code === 'P2025') {
            console.warn(`⚠ Product not found in DB: ${productCode}`);
            totalNotFound += 1;
          } else {
            console.error(`Unexpected error updating product ${productCode}:`, err);
          }
        }
      }

      skip += pageSize;
      if (products.length < pageSize) {
        console.log('Reached last partial page — stopping...');
        break;
      }
    }

    console.log('=== Update Product Images Completed ===');
    console.log(`Total NAV products fetched: ${totalFetched}`);
    console.log(`Total products updated: ${totalUpdated}`);
    console.log(`Total products not found in DB: ${totalNotFound}`);
  } catch (error) {
    console.error('An error occurred while updating product images:', error);
  } finally {
    await prisma.$disconnect();
  }
};

updateProductImg().catch(console.error);
