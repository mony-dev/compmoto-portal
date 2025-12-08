import axios from 'axios';
import bcrypt from 'bcrypt';
import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

const NAV_URL = process.env.NAV_URL!;
const NAV_BASIC_AUTH = process.env.NAV_BASIC_AUTH!;
const COMPANY_ID = process.env.COMPANY_ID!;

export async function syncNavCustomersIncremental(): Promise<{ insertedCount: number }> {
  const pageSize = 100;
  let skip = 0;
  let totalInserted = 0;

  const allGroups = await prisma.customerGroup.findMany();
  const groupMap = new Map<string, number>();
  for (const g of allGroups) {
    groupMap.set(g.name, g.id);
  }

  const hashedPassword = await bcrypt.hash('password', 10); 

  while (true) {
    const url = `${NAV_URL}/companies(${COMPANY_ID})/api_MasterCustomerLists?$top=${pageSize}&$skip=${skip}`;

    const response = await axios.get(url, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `${NAV_BASIC_AUTH}`,
      },
    });

    const customers: any[] = response.data?.value ?? [];
    if (!customers.length) break;

    const relevantCustomers = customers.filter(
      (c) =>
        c.CustNo &&
        typeof c.CustNo === 'string' &&
        c.DescriptionPriceGroup &&
        String(c.DescriptionPriceGroup).trim() !== '',
    );

    if (relevantCustomers.length === 0) {
      skip += pageSize;
      if (customers.length < pageSize) break;
      continue;
    }

    const pageGroupNames = Array.from(
      new Set(
        relevantCustomers
          .map((c) => String(c.DescriptionPriceGroup).trim())
          .filter((name) => !!name),
      ),
    );

    const missingGroupNames = pageGroupNames.filter(
      (name) => !groupMap.has(name),
    );

    if (missingGroupNames.length > 0) {
      await prisma.customerGroup.createMany({
        data: missingGroupNames.map((name) => ({ name })),
        skipDuplicates: true,
      });

      const newGroups = await prisma.customerGroup.findMany({
        where: { name: { in: missingGroupNames } },
      });

      for (const g of newGroups) {
        groupMap.set(g.name, g.id);
      }
    }

    const emailsInPage = relevantCustomers.map(
      (c) => `${c.CustNo}@compmoto.com`,
    );

    const existingUsers = await prisma.user.findMany({
      where: {
        email: {
          in: emailsInPage,
        },
      },
      select: { email: true },
    });

    const existingEmailSet = new Set(existingUsers.map((u) => u.email));

    const usersToInsert: Prisma.UserCreateManyInput[] = relevantCustomers
      .filter((c) => {
        const custNo = String(c.CustNo).trim();
        const email = `${custNo}@compmoto.com`;
        return !existingEmailSet.has(email);
      })
      .map((c): Prisma.UserCreateManyInput => {
        const custNo = String(c.CustNo).trim();
        const email = `${custNo}@compmoto.com`;
        const groupName = String(c.DescriptionPriceGroup).trim();
        const customerGroupId = groupMap.get(groupName) ?? undefined; // field optional

        return {
          email,
          name: (c.CustName as string) ?? '',
          paymentTerms: (c.PaymentTerms as string) ?? '',
          creditPoint: Number(c.CreditPoint ?? 0),
          phoneNumber: (c.PhoneNo as string) ?? '',
          gender: (c.Gender as string) ?? '',
          vatNo: (c.VATNo as string) ?? '',
          custAddress: (c.CustAddress as string) ?? '',
          shipToAddress: (c.ShipToAddress as string) ?? '',
          balanceLCY: Number(c.BalanceLCY ?? 0),
          contactName: (c.ContactName as string) ?? '',
          encryptedPassword: hashedPassword,
          role: 'USER',
          custPriceGroup: (c.CustPriceGroup as string) ?? '',
          custNo,
          rewardPoint: Number(c.RewardPoint ?? 0),
          customerGroupId,
        };
      });

    if (usersToInsert.length > 0) {
      const result = await prisma.user.createMany({
        data: usersToInsert,
        skipDuplicates: true,
      });

      totalInserted += result.count;
    }

    skip += pageSize;
    if (customers.length < pageSize) break;
  }

  return { insertedCount: totalInserted };
}
