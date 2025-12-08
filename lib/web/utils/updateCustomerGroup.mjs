import axios from 'axios';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ดึงทีละ 100 record
const PAGE_SIZE = 100;

// แนะนำให้ตั้งสองตัวนี้ใน .env
const NAV_URL = process.env.NAV_URL;          // ex. http://.../api/compmoto/pos/v2.0/companies(...)
const NAV_BASIC_AUTH = process.env.NAV_BASIC_AUTH; // ex. YWRtaW46UEBzc3cwcmQ=

async function updateCustomerGroupFromNav() {
  let skip = 0;

  try {
    while (true) {
      console.log(`Fetching customers batch skip=${skip} ...`);

      const url = `${NAV_URL}/api_MasterCustomerLists?$top=${PAGE_SIZE}&$skip=${skip}`;

      const response = await axios.get(url, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `${NAV_BASIC_AUTH}`,
        },
      });

      const customers = (response.data && response.data.value) || [];
      console.log(`  → got ${customers.length} customers`);

      if (!customers.length) {
        console.log('No more customer records. Completed.');
        break;
      }

      for (const customer of customers) {
        await updateUserCustomerGroup(customer);
      }

      skip += PAGE_SIZE;
    }
  } catch (err) {
    console.error('Failed to sync customer groups:', err);
  } finally {
    await prisma.$disconnect();
  }
}

async function updateUserCustomerGroup(customer) {
  const custNo = customer && customer.CustNo;
  const custGroupName = customer && customer.DescriptionPriceGroup;

  // กรณี DescriptionPriceGroup เป็น "" หรือไม่มี → ข้าม
  if (!custNo || !custGroupName || !String(custGroupName).trim()) {
    console.log('Skipping customer due to missing group', {
      custNo,
      custGroupName,
    });
    return;
  }

  try {
    // หา group เดิม
    let customerGroup = await prisma.customerGroup.findFirst({
      where: { name: custGroupName },
    });

    // ไม่มีให้สร้างใหม่
    if (!customerGroup) {
      customerGroup = await prisma.customerGroup.create({
        data: { name: custGroupName },
      });
      console.log(
        `Created customerGroup "${custGroupName}" (id=${customerGroup.id})`
      );
    }

    // อัปเดต user ให้เชื่อม group นี้
    const updatedUser = await prisma.user.update({
      where: { custNo },
      data: {
        customerGroup: { connect: { id: customerGroup.id } },
      },
    });

    console.log(
      `Linked user ${custNo} (id=${updatedUser.id}) → group "${custGroupName}"`
    );
  } catch (err) {
    if (err && err.code === 'P2025') {
      console.error(`User with CustNo ${custNo} not found in DB.`);
    } else {
      console.error('Unexpected error while updating user group:', err);
    }
  }
}

updateCustomerGroupFromNav().catch(console.error);
