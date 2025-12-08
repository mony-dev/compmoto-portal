import axios from 'axios';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const NAV_URL = process.env.NAV_URL;
const COMPANY_ID = process.env.COMPANY_ID;
const NAV_BASIC_AUTH = process.env.NAV_BASIC_AUTH;

if (!NAV_URL) throw new Error('Missing NAV_URL in .env');
if (!COMPANY_ID) throw new Error('Missing COMPANY_ID in .env');
if (!NAV_BASIC_AUTH) throw new Error('Missing NAV_BASIC_AUTH in .env');

const updateLot = async () => {
  try {
    console.log("=== Start Update Lot Info ===");

    const products = await prisma.product.findMany();
    console.log(`Total products in DB: ${products.length}`);

    let processed = 0;

    for (const product of products) {
      processed++;
      console.log(`\n[${processed}/${products.length}] Processing product: ${product.code}`);

      const url = `${NAV_URL}/companies(${COMPANY_ID})/api_MasterItemByLot?$filter=ItemNo eq '${product.code}'`;

      console.log(`Calling NAV API → ${url}`);

      let response;
      try {
        response = await axios.get(url, {
          headers: {
            "Content-Type": "application/json",
            Authorization: NAV_BASIC_AUTH,
          },
        });
      } catch (err) {
        console.error(`❌ NAV request failed for ${product.code}:`, err.message);
        continue;
      }

      const items = response.data?.value ?? [];
      console.log(`→ NAV returned ${items.length} lot records`);

      const years = [
        { year: "2019", discount: 0, isActive: false, isDisable: true },
        { year: "2020", discount: 0, isActive: false, isDisable: true },
        { year: "2021", discount: 0, isActive: false, isDisable: true },
        { year: "2022", discount: 0, isActive: false, isDisable: true },
        { year: "2023", discount: 0, isActive: false, isDisable: true },
        { year: "2024", discount: 0, isActive: false, isDisable: true },
      ];

      for (const lot of items) {
        const lotNo = String(lot.LotNo ?? "").trim();

        if (!lotNo) continue;

        console.log(`• Checking lot: ${lotNo}`);

        if (lotNo.includes("G") || lotNo.includes("19")) {
          years[0].isActive = true;
          years[0].isDisable = false;
        }
        if (lotNo.includes("H") || lotNo.includes("20")) {
          years[1].isActive = true;
          years[1].isDisable = false;
        }
        if (lotNo.includes("I") || lotNo.includes("21")) {
          years[2].isActive = true;
          years[2].isDisable = false;
        }
        if (lotNo.includes("J") || lotNo.includes("22")) {
          years[3].isActive = true;
          years[3].isDisable = false;
        }
        if (lotNo.includes("K") || lotNo.includes("23")) {
          years[4].isActive = true;
          years[4].isDisable = false;
        }
      }

      await prisma.product.update({
        where: { id: product.id },
        data: { years: JSON.stringify(years) },
      });

      console.log(`✓ Updated product ${product.code} years →`, years);
    }

    console.log("\n=== Update Lot Completed ===");
  } catch (error) {
    console.error("❌ Unexpected error in updateLot():", error);
  } finally {
    await prisma.$disconnect();
  }
};

updateLot().catch(console.error);
