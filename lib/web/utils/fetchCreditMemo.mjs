import axios from "axios";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const NAV_URL = process.env.NAV_URL;
const COMPANY_ID = process.env.COMPANY_ID;
const NAV_BASIC_AUTH = process.env.NAV_BASIC_AUTH;

if (!NAV_URL) throw new Error("Missing NAV_URL in .env");
if (!COMPANY_ID) throw new Error("Missing COMPANY_ID in .env");
if (!NAV_BASIC_AUTH) throw new Error("Missing NAV_BASIC_AUTH in .env");

const stringToFloat = (val) => {
  if (!val) return 0;
  return parseFloat(String(val).replace(/,/g, ""));
};

const fetchCreditMemo = async () => {
  try {
    console.log("=== Start Fetch Posted Credit Memo ===");

    const users = await prisma.user.findMany({
      where: { role: "USER" },
      select: { id: true, custNo: true },
    });

    console.log(`Total users to process: ${users.length}`);

    let processedUsers = 0;
    let totalMemoCreated = 0;

    for (const user of users) {
      processedUsers++;
      console.log(`\n[${processedUsers}/${users.length}] Fetching CN for custNo: ${user.custNo}`);

      const pageSize = 100;
      let skip = 0;
      let hasMore = true;

      while (hasMore) {
        const url =
          `${NAV_URL}/companies(${COMPANY_ID})/api_MasterPostedCreditMemoLists` +
          `?$filter=CustNo eq '${user.custNo}'&$top=${pageSize}&$skip=${skip}`;

        console.log(`→ Calling NAV: ${url}`);

        let response;
        try {
          response = await axios.get(url, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `${NAV_BASIC_AUTH}`,
            },
          });
        } catch (err) {
          console.error(`❌ NAV request failed for customer ${user.custNo}:`, err.message);
          break;
        }

        const sales = response.data?.value ?? [];
        console.log(`✓ NAV returned ${sales.length} CN records`);

        if (sales.length === 0) break;

        for (const sale of sales) {
          const salesNo = sale.SalesNo ?? null;

          if (!salesNo) {
            console.warn(`⚠ Missing SalesNo for user ${user.custNo}`);
            continue;
          }

          const totalAmount = stringToFloat(sale.TotalAmount);
          const amountIncludingVAT = stringToFloat(sale.AmountIncludingVAT);

          const postDate = sale.PostDate
            ? new Date(sale.PostDate)
            : null;

          if (!postDate) {
            console.warn(`⚠ Missing PostDate for CN: ${salesNo}`);
            continue;
          }

          const existing = await prisma.memoCredit.findFirst({
            where: { documentNo: salesNo },
          });

          if (existing) {
            console.log(`• CN already exists → ${salesNo}`);
            continue;
          }

          await prisma.memoCredit.create({
            data: {
              userId: user.id,
              documentNo: salesNo,
              totalAmount,
              amountIncludingVAT,
              date: postDate,
            },
          });

          totalMemoCreated++;
          console.log(`✓ Created CN record → ${salesNo}`);
        }

        // next page
        skip += pageSize;
        if (sales.length < pageSize) {
          hasMore = false;
        }
      }
    }

    console.log("\n=== Fetch Posted Credit Memo Completed ===");
    console.log(`Total credit memos created: ${totalMemoCreated}`);

  } catch (error) {
    console.error("❌ Unexpected error in fetchCreditMemo:", error);
  } finally {
    await prisma.$disconnect();
  }
};

fetchCreditMemo().catch(console.error);
