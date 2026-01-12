// import axios from "axios";
// import { PrismaClient } from "@prisma/client";

// const prisma = new PrismaClient();

// const NAV_URL = process.env.NAV_URL;
// const COMPANY_ID = process.env.COMPANY_ID;
// const NAV_BASIC_AUTH = process.env.NAV_BASIC_AUTH;

// if (!NAV_URL) throw new Error("Missing NAV_URL in .env");
// if (!COMPANY_ID) throw new Error("Missing COMPANY_ID in .env");
// if (!NAV_BASIC_AUTH) throw new Error("Missing NAV_BASIC_AUTH in .env");

// const stringToFloat = (val) => {
//   if (!val) return 0;
//   return parseFloat(String(val).replace(/,/g, ""));
// };

// const fetchCreditMemo = async () => {
//   try {
//     console.log("=== Start Fetch Posted Credit Memo ===");

//     const users = await prisma.user.findMany({
//       where: { role: "USER" },
//       select: { id: true, custNo: true },
//     });

//     console.log(`Total users to process: ${users.length}`);

//     let processedUsers = 0;
//     let totalMemoCreated = 0;

//     for (const user of users) {
//       processedUsers++;
//       console.log(`\n[${processedUsers}/${users.length}] Fetching CN for custNo: ${user.custNo}`);

//       const pageSize = 100;
//       let skip = 0;
//       let hasMore = true;

//       while (hasMore) {
//         const url =
//           `${NAV_URL}/companies(${COMPANY_ID})/api_MasterPostedCreditMemoLists` +
//           `?$filter=CustNo eq '${user.custNo}'&$top=${pageSize}&$skip=${skip}`;

//         console.log(`→ Calling NAV: ${url}`);

//         let response;
//         try {
//           response = await axios.get(url, {
//             headers: {
//               "Content-Type": "application/json",
//               Authorization: `${NAV_BASIC_AUTH}`,
//             },
//           });
//         } catch (err) {
//           console.error(`❌ NAV request failed for customer ${user.custNo}:`, err.message);
//           break;
//         }

//         const sales = response.data?.value ?? [];
//         console.log(`✓ NAV returned ${sales.length} CN records`);

//         if (sales.length === 0) break;

//         for (const sale of sales) {
//           const salesNo = sale.SalesNo ?? null;

//           if (!salesNo) {
//             console.warn(`⚠ Missing SalesNo for user ${user.custNo}`);
//             continue;
//           }

//           const totalAmount = stringToFloat(sale.TotalAmount);
//           const amountIncludingVAT = stringToFloat(sale.AmountIncludingVAT);

//           const postDate = sale.PostDate
//             ? new Date(sale.PostDate)
//             : null;

//           if (!postDate) {
//             console.warn(`⚠ Missing PostDate for CN: ${salesNo}`);
//             continue;
//           }

//           const existing = await prisma.memoCredit.findFirst({
//             where: { documentNo: salesNo },
//           });

//           if (existing) {
//             console.log(`• CN already exists → ${salesNo}`);
//             continue;
//           }

//           await prisma.memoCredit.create({
//             data: {
//               userId: user.id,
//               documentNo: salesNo,
//               totalAmount,
//               amountIncludingVAT,
//               date: postDate,
//             },
//           });

//           totalMemoCreated++;
//           console.log(`✓ Created CN record → ${salesNo}`);
//         }

//         // next page
//         skip += pageSize;
//         if (sales.length < pageSize) {
//           hasMore = false;
//         }
//       }
//     }

//     console.log("\n=== Fetch Posted Credit Memo Completed ===");
//     console.log(`Total credit memos created: ${totalMemoCreated}`);

//   } catch (error) {
//     console.error("❌ Unexpected error in fetchCreditMemo:", error);
//   } finally {
//     await prisma.$disconnect();
//   }
// };

// fetchCreditMemo().catch(console.error);
// import axios from "axios";
// import pLimit from "p-limit";
// import { PrismaClient } from "@prisma/client";

// const prisma = new PrismaClient();

// const NAV_URL = process.env.NAV_URL;
// const COMPANY_ID = process.env.COMPANY_ID;
// const NAV_BASIC_AUTH = process.env.NAV_BASIC_AUTH;

// if (!NAV_URL) throw new Error("Missing NAV_URL in .env");
// if (!COMPANY_ID) throw new Error("Missing COMPANY_ID in .env");
// if (!NAV_BASIC_AUTH) throw new Error("Missing NAV_BASIC_AUTH in .env");

// // ---------------- config ----------------
// const USER_BATCH_SIZE = Number(process.env.CN_USER_BATCH_SIZE ?? 50); // ✅ จำกัด users ต่อรอบ
// const NAV_PAGE_SIZE = Number(process.env.CN_NAV_PAGE_SIZE ?? 100);
// const NAV_DELAY_MS = Number(process.env.CN_NAV_DELAY_MS ?? 50); // ✅ delay ระหว่าง NAV request (0=ปิด)
// const NAV_TIMEOUT_MS = Number(process.env.CN_NAV_TIMEOUT_MS ?? 20_000);
// const NAV_CONCURRENCY = Number(process.env.CN_NAV_CONCURRENCY ?? 3); // ✅ ยิงพร้อมกันได้เท่านี้

// // incremental (optional)
// const LOOKBACK_DAYS = Number(process.env.CREDITMEMO_LOOKBACK_DAYS ?? 0); // 0=ปิด incremental filter

// const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// const stringToFloat = (val) => {
//   if (!val) return 0;
//   return parseFloat(String(val).replace(/,/g, ""));
// };

// const navHttp = axios.create({
//   timeout: NAV_TIMEOUT_MS,
//   headers: {
//     "Content-Type": "application/json",
//     Authorization: NAV_BASIC_AUTH,
//   },
// });

// const limitNav = pLimit(Number.isFinite(NAV_CONCURRENCY) ? NAV_CONCURRENCY : 3);

// function toISODateOnly(d) {
//   // YYYY-MM-DD
//   const yyyy = d.getFullYear();
//   const mm = String(d.getMonth() + 1).padStart(2, "0");
//   const dd = String(d.getDate()).padStart(2, "0");
//   return `${yyyy}-${mm}-${dd}`;
// }

// async function buildExistingSet(fromDate) {
//   // ✅ preload existing CN docs (ลด findFirst ทีละใบ)
//   const where = fromDate
//     ? { date: { gte: fromDate } }
//     : undefined;

//   const existing = await prisma.memoCredit.findMany({
//     where,
//     select: { documentNo: true },
//   });

//   return new Set(existing.map((x) => x.documentNo));
// }

// async function getFromDateIfIncremental() {
//   if (!LOOKBACK_DAYS || LOOKBACK_DAYS <= 0) return null;

//   const last = await prisma.memoCredit.findFirst({
//     orderBy: { date: "desc" },
//     select: { date: true },
//   });

//   const base = last?.date ? new Date(last.date) : new Date();
//   base.setDate(base.getDate() - LOOKBACK_DAYS);

//   return base; // Date
// }

// const fetchCreditMemo = async () => {
//   try {
//     console.log("=== Start Fetch Posted Credit Memo (Throttled) ===");
//     console.log(
//       `CN_USER_BATCH_SIZE=${USER_BATCH_SIZE} CN_NAV_CONCURRENCY=${NAV_CONCURRENCY} CN_NAV_DELAY_MS=${NAV_DELAY_MS} CN_NAV_TIMEOUT_MS=${NAV_TIMEOUT_MS}`
//     );

//     const fromDate = await getFromDateIfIncremental();
//     if (fromDate) {
//       console.log(
//         `Incremental mode ON: fromDate >= ${toISODateOnly(fromDate)} (lookback=${LOOKBACK_DAYS} days)`
//       );
//     } else {
//       console.log("Incremental mode OFF");
//     }

//     const existingSet = await buildExistingSet(fromDate);

//     // ✅ ดึง user ทั้งหมด แล้ว process ทีละ batch
//     const users = await prisma.user.findMany({
//       where: { role: "USER" },
//       select: { id: true, custNo: true },
//       orderBy: { id: "asc" },
//     });

//     console.log(`Total users to process: ${users.length}`);

//     let totalMemoCreated = 0;
//     let totalMemoSkippedExists = 0;
//     let totalUsersProcessed = 0;

//     for (let i = 0; i < users.length; i += USER_BATCH_SIZE) {
//       const batch = users.slice(i, i + USER_BATCH_SIZE);
//       console.log(`\n=== User batch ${i / USER_BATCH_SIZE + 1} (${batch.length} users) ===`);

//       // ✅ ประมวลผล user batch แบบจำกัด concurrency
//       await Promise.all(
//         batch.map((user) =>
//           limitNav(async () => {
//             totalUsersProcessed += 1;
//             const custNo = user.custNo;
//             if (!custNo) return;

//             console.log(`[${totalUsersProcessed}/${users.length}] custNo=${custNo}`);

//             let skip = 0;

//             while (true) {
//               // NAV filter: CustNo eq '...'
//               // incremental (optional): ถ้า NAV รองรับ filter date ด้วย ให้เพิ่ม (เช่น PostDate ge ...)
//               // แต่ถ้าไม่ชัวร์ว่า field/format รองรับ ให้ปล่อยไว้ (ปลอดภัยกว่า)
//               const url =
//                 `${NAV_URL}/companies(${COMPANY_ID})/api_MasterPostedCreditMemoLists` +
//                 `?$filter=CustNo eq '${custNo}'&$top=${NAV_PAGE_SIZE}&$skip=${skip}`;

//               if (NAV_DELAY_MS > 0) await sleep(NAV_DELAY_MS);

//               let response;
//               try {
//                 response = await navHttp.get(url);
//               } catch (err) {
//                 console.error(`❌ NAV request failed custNo=${custNo}:`, err?.message ?? err);
//                 break;
//               }

//               const sales = response.data?.value ?? [];
//               if (!sales.length) break;

//               for (const sale of sales) {
//                 const salesNo = sale.SalesNo ? String(sale.SalesNo).trim() : null;
//                 if (!salesNo) continue;

//                 // ✅ skip ถ้ามีแล้ว (O(1))
//                 if (existingSet.has(salesNo)) {
//                   totalMemoSkippedExists += 1;
//                   continue;
//                 }

//                 const postDate = sale.PostDate ? new Date(sale.PostDate) : null;
//                 if (!postDate) continue;

//                 // incremental (local): ถ้าเปิด lookback แล้ว record เก่ากว่า fromDate ก็ข้ามได้
//                 if (fromDate && postDate < fromDate) {
//                   continue;
//                 }

//                 const totalAmount = stringToFloat(sale.TotalAmount);
//                 const amountIncludingVAT = stringToFloat(sale.AmountIncludingVAT);

//                 try {
//                   await prisma.memoCredit.create({
//                     data: {
//                       userId: user.id,
//                       documentNo: salesNo,
//                       totalAmount,
//                       amountIncludingVAT,
//                       date: postDate,
//                     },
//                   });

//                   existingSet.add(salesNo);
//                   totalMemoCreated += 1;
//                 } catch (e) {
//                   // ถ้ามี unique constraint แล้วชนกัน ก็แปลว่ามีแล้ว
//                   // กันกรณี concurrent run
//                   console.warn(`⚠ create memoCredit failed ${salesNo}:`, e?.message ?? e);
//                 }
//               }

//               skip += NAV_PAGE_SIZE;
//               if (sales.length < NAV_PAGE_SIZE) break;
//             }
//           })
//         )
//       );
//     }

//     console.log("\n=== Fetch Posted Credit Memo Completed ===");
//     console.log(`Total credit memos created: ${totalMemoCreated}`);
//     console.log(`Total skipped (already exists): ${totalMemoSkippedExists}`);
//   } catch (error) {
//     console.error("❌ Unexpected error in fetchCreditMemo:", error);
//   } finally {
//     await prisma.$disconnect();
//   }
// };

// fetchCreditMemo().catch(console.error);
